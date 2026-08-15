/**
 * `liveTokenUsage` projection unit: the real-time generation rate of the
 * session's CURRENT stream, served to the bar over the session-projection
 * channel — DSH's live-state path from host to browser.
 *
 * The unit folds `assistant/chunk` events as they commit: each output delta
 * (text / reasoning / tool-call) contributes an estimated token count
 * (~4 chars per token) and refreshes the measurement window, so the change
 * feed fires once per chunk and the client's `useProjection('liveTokenUsage')`
 * re-renders the TPS segment while the stream is hot (the bar throttles the
 * displayed figure to at most two refreshes per second). When the provider
 * reports a `usage` chunk mid-stream the estimate is replaced by the exact
 * `outputTokens`, and the rate is then provider-accurate.
 *
 * Rate semantics: tokens accumulated since the stream's first output token
 * divided by that span (a running average, not an instant sample), rounded to
 * one decimal. Once a stream settles (`assistant/message`, `step/end`, or
 * `turn/end`) the active window is dropped and the rate reports **0** — no
 * active stream means no generation, so the bar's TPS segment falls to zero
 * the moment the agent stops producing instead of freezing on a stale value.
 *
 * One hazard is folded explicitly: the agent loop retries a failed stream
 * under the SAME (turn, step) with no boundary event in between, so the
 * log's `llm/retry` marker (plugin-merged, structurally matched) resets the
 * measurement window — without it every retry attempt's tokens would keep
 * accumulating into one window and the rate would climb while the agent is
 * stuck retrying.
 *
 * A second hazard is the estimator's own clock: providers flush deltas in
 * bursts (tool-call JSON arguments arrive with dt≈0–2 ms, and the
 * persistence layer can batch-flush), so a plain running average over the
 * window span climbs without bound during a burst — tokens keep accruing
 * while `latest - first` stays frozen. The estimated branch therefore uses
 * an EWMA over per-chunk INSTANT rates with a minimum inter-chunk interval
 * (burst deltas are treated as spaced at MIN_DT_MS), which bounds the
 * displayed figure to the real generation envelope; the exact branch
 * (provider-reported usage) keeps the window average, which is faithful
 * there, with a minimum span floor.
 *
 * The fold is pure over the durable log (event `time` is the only clock), so
 * replay, restore, and the persisted projection cache all reproduce the same
 * values — no wall clock enters the state.
 *
 * @module @dsh-external/dsh-status-bar/live-rate
 */

import { z } from 'zod'
import type { StreamChunk, TokenUsage } from '@deepseek-ai/dsh-llm'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'

/** Rough character density used until the provider reports exact usage. */
export const CHARS_PER_TOKEN = 4

/**
 * Minimum inter-chunk interval for the estimated branch's instant rate.
 * Providers flush bursts (tool-call arguments, batched deltas) with dt≈0,
 * so a raw dt would report absurd rates; burst deltas are treated as spaced
 * at this floor instead. 20 ms bounds a burst to the real generation
 * envelope (measured: ≤ ~360 tok/s on real sessions) while genuine
 * high-speed streaming still reads through.
 */
export const MIN_DT_MS = 20

/** Minimum window span for the exact (provider-reported) branch's average. */
export const MIN_SPAN_MS = 250

/**
 * EWMA weight of the newest instant rate (0..1); higher = more responsive.
 * 0.6 keeps the figure snappy (≈2 chunks to a 90% step) while the instant
 * rate's dt floor still damps burst noise.
 */
export const EWMA_ALPHA = 0.6

/** Wire value: the live rate is absent until the first measurable output. */
export interface LiveTokenUsageView {
  tokensPerSecond?: number
}

/**
 * Fold state: the active stream's counters plus the last measured rate.
 * Plain JSON per the unit contract (persisted-cache precondition).
 */
interface LiveRateState {
  /** Turn/step of the stream being measured; null while idle. */
  turn: number | null
  step: number | null
  /** Event time of the first counted output chunk, ms. */
  firstOutputTime: number | null
  /** Event time of the most recent counted output chunk, ms. */
  latestOutputTime: number | null
  /** Event time of the previous counted output chunk, ms (inter-chunk dt for the instant rate). */
  prevOutputTime: number | null
  /** Output tokens: provider-reported once a `usage` chunk lands, chars/4 estimate before. */
  outputTokens: number
  /** Whether `outputTokens` is still an estimate. */
  estimated: boolean
  /** Last measured rate (tok/s); 0 once the stream settles (no active generation). */
  tokensPerSecond: number | null
}

const liveTokenUsageSchema = z.object({
  tokensPerSecond: z.number().positive().optional(),
}).strict()

/** The current stream is the one tracked by the fold state. */
function isTracked(state: LiveRateState, turn: number, step: number): boolean {
  return state.turn === turn && state.step === step
}

/**
 * Estimated tokens contributed by one stream chunk. Non-output chunks
 * (block-start / block-end / finish) contribute zero — their text was already
 * counted by the deltas — and empty deltas are skipped like dsh-llm's
 * `isTokenDelta` does. Every counted delta contributes at least 1 token so a
 * single-character stream still produces a measurable rate.
 */
function chunkTokens(chunk: StreamChunk): number {
  switch (chunk.type) {
    case 'text-delta':
      return deltaTokens(chunk.text)
    case 'reasoning-delta':
      return deltaTokens(chunk.text)
    case 'tool-call-delta':
      return deltaTokens(chunk.argumentsDelta)
        + (chunk.name === undefined ? 0 : deltaTokens(chunk.name))
    default:
      return 0
  }
}

function deltaTokens(text: string): number {
  if (text === '') return 0
  return Math.max(1, Math.ceil(text.length / CHARS_PER_TOKEN))
}

/** Provider-reported output tokens, guarded the way the stats fold guards node usage. */
function usageOutputTokens(usage: TokenUsage | undefined): number | null {
  if (usage === undefined) return null
  const value = usage.outputTokens
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

/**
 * Instant rate of one counted delta: `added` tokens over the inter-chunk
 * interval, floored at MIN_DT_MS so burst-flushed deltas (dt≈0) cannot
 * report absurd figures. The window's first chunk has no predecessor, so it
 * is treated as spaced at the floor too.
 */
function instantRateOf(addedTokens: number, prevTime: number | null, nowTime: number): number {
  const dt = prevTime === null ? MIN_DT_MS : Math.max(nowTime - prevTime, MIN_DT_MS)
  return Math.round(addedTokens * 1_000 / dt * 10) / 10
}

/** Exponential smoothing of the instant rate; a null carried rate adopts the first sample. */
function ewmaRate(carried: number | null, instant: number): number {
  if (carried === null) return instant
  return Math.round((carried * (1 - EWMA_ALPHA) + instant * EWMA_ALPHA) * 10) / 10
}

/**
 * Window average for the exact branch (provider-reported usage): faithful
 * there because both tokens and span are real, with a span floor so a
 * burst-then-settle stream still lands on a sane figure.
 */
function spanRateOf(outputTokens: number, firstTime: number, nowTime: number): number {
  const span = Math.max(nowTime - firstTime, MIN_SPAN_MS)
  return Math.round(outputTokens * 1_000 / span * 10) / 10
}

/** The idle state every settle lands on (window dropped, rate reported as 0). */
function settled(state: LiveRateState): LiveRateState {
  return {
    turn: null,
    step: null,
    firstOutputTime: null,
    latestOutputTime: null,
    prevOutputTime: null,
    outputTokens: 0,
    estimated: false,
    tokensPerSecond: 0,
  }
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Real-time generation throughput (tok/s) of the current stream, folded by this plugin's host side. */
    liveTokenUsage: LiveTokenUsageView
  }
}

/**
 * The `liveTokenUsage` unit registered on `ctx.sessionProjections` (exported
 * for the unit spec). Only `assistant/chunk` and the stream-closing events
 * change the state reference, so the change feed stays quiet otherwise.
 */
export const liveTokenUsageProjectionDefinition:
ProjectionDefinition<'liveTokenUsage', LiveRateState> = {
  key: 'liveTokenUsage',
  schema: liveTokenUsageSchema,
  init: () => ({
    turn: null,
    step: null,
    firstOutputTime: null,
    latestOutputTime: null,
    prevOutputTime: null,
    outputTokens: 0,
    estimated: false,
    tokensPerSecond: null,
  }),
  apply: (state, event) => {
    // Plugin-merged log events (dsh-llm-retry's `llm/retry` marker) are not in
    // the static SessionEvent union, so match it structurally before the
    // switch narrows `event.type`. The retry marker is committed BEFORE the
    // NEXT attempt streams — same (turn, step), no step boundary in between.
    // Without a reset here every attempt's tokens would keep accumulating
    // into one window and the rate would climb while the agent is stuck
    // retrying; resetting restarts the window so only the current attempt
    // measures.
    if ((event as { type?: string }).type === 'llm/retry' && state.turn !== null) {
      const data = (event as { data?: { turn?: unknown; step?: unknown } }).data
      if (data?.turn === state.turn && data?.step === state.step) {
        // Window reset, but keep the measured rate across the short retry
        // wait (0.5 s+) — a fresh attempt is about to stream, so flashing 0
        // here would just flicker.
        return { ...settled(state), turn: state.turn, step: state.step, tokensPerSecond: state.tokensPerSecond }
      }
    }
    switch (event.type) {
      case 'assistant/chunk': {
        const { turn, step, chunk } = event.data
        const fresh = !isTracked(state, turn, step)
        let outputTokens: number
        let estimated: boolean
        let rate: number | null
        if (chunk.type === 'usage') {
          const reported = usageOutputTokens(chunk.usage)
          if (reported === null) return state
          // Exact buckets supersede the estimate; the rate is the faithful
          // window average (provider tokens over real elapsed time), floored
          // by MIN_SPAN_MS against burst-then-settle streams.
          outputTokens = reported
          estimated = false
          const first = fresh || state.firstOutputTime === null ? event.time : state.firstOutputTime
          rate = spanRateOf(outputTokens, first, event.time)
        } else {
          // Once the provider reported exact usage for the CURRENT window,
          // further deltas neither add tokens nor extend the span — the exact
          // rate must not be diluted. A retry reset zeroes the window, so
          // exactness starts over with the next attempt.
          if (state.outputTokens > 0 && !state.estimated) return state
          const added = chunkTokens(chunk)
          if (added === 0) return state
          outputTokens = (fresh ? 0 : state.outputTokens) + added
          estimated = true
          // Estimated branch: EWMA over per-chunk instant rates (inter-chunk
          // dt floored at MIN_DT_MS), so burst-flushed deltas keep the figure
          // inside the real generation envelope instead of climbing.
          const instant = instantRateOf(added, fresh ? null : state.prevOutputTime, event.time)
          rate = ewmaRate(state.tokensPerSecond, instant)
        }
        // The window starts at the first counted chunk of the current attempt;
        // a retry reset clears firstOutputTime, so the next chunk re-anchors.
        const firstOutputTime = fresh || state.firstOutputTime === null
          ? event.time
          : state.firstOutputTime
        return {
          turn,
          step,
          firstOutputTime,
          latestOutputTime: event.time,
          prevOutputTime: event.time,
          outputTokens,
          estimated,
          tokensPerSecond: rate,
        }
      }
      case 'assistant/message': {
        // The stream finished: fold the assembled message's usage into the
        // exact buckets, then settle — the bar reports 0 while no stream is
        // active (see `settled`).
        if (!isTracked(state, event.data.turn, event.data.step)) return state
        const reported = usageOutputTokens(event.data.usage)
        const outputTokens = reported !== null ? reported : state.outputTokens
        const estimated = reported !== null ? false : state.estimated
        return settled({ ...state, outputTokens, estimated })
      }
      case 'step/end': {
        // A step closed without a message (cancelled) settles the same way.
        if (!isTracked(state, event.data.turn, event.data.step)) return state
        return settled(state)
      }
      case 'turn/end':
        return state.turn === null ? state : settled(state)
      default:
        return state
    }
  },
  view: state => state.tokensPerSecond === null ? {} : { tokensPerSecond: state.tokensPerSecond },
  stateVersion: 2,
}
