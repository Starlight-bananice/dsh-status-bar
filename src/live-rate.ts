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
 * Rate semantics mirror the ecosystem's live-stats convention: tokens
 * accumulated since the stream's first output token divided by that span
 * (a running average, not an instant sample), rounded to one decimal. Once a
 * stream settles (`assistant/message`, `step/end`, or `turn/end`) the active
 * window is dropped but the last measured rate is carried, so an idle bar
 * still shows the most recent throughput instead of vanishing.
 *
 * One hazard is folded explicitly: the agent loop retries a failed stream
 * under the SAME (turn, step) with no boundary event in between, so the
 * log's `llm/retry` marker (plugin-merged, structurally matched) resets the
 * measurement window — without it every retry attempt's tokens would keep
 * accumulating into one window and the rate would climb while the agent is
 * stuck retrying.
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

/** Wire value: the live rate is absent until the first measurable output. */
export interface LiveTokenUsageView {
  tokensPerSecond?: number
}

/**
 * Fold state: the active stream's counters plus the carried last rate.
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
  /** Output tokens: provider-reported once a `usage` chunk lands, chars/4 estimate before. */
  outputTokens: number
  /** Whether `outputTokens` is still an estimate. */
  estimated: boolean
  /** Last measured rate (tok/s), carried while idle / across rate-less streams. */
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

/** Running average since the stream's first output token, or the carried rate when not measurable. */
function rateOf(
  outputTokens: number,
  firstOutputTime: number | null,
  latestOutputTime: number | null,
  carried: number | null,
): number | null {
  if (outputTokens <= 0 || firstOutputTime === null || latestOutputTime === null) return carried
  const span = latestOutputTime - firstOutputTime
  if (span <= 0) return carried
  return Math.round(outputTokens * 1_000 / span * 10) / 10
}

/** The idle state every settle lands on (active window dropped, rate carried). */
function settled(state: LiveRateState): LiveRateState {
  return {
    turn: null,
    step: null,
    firstOutputTime: null,
    latestOutputTime: null,
    outputTokens: 0,
    estimated: false,
    tokensPerSecond: state.tokensPerSecond,
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
        return { ...settled(state), turn: state.turn, step: state.step }
      }
    }
    switch (event.type) {
      case 'assistant/chunk': {
        const { turn, step, chunk } = event.data
        const fresh = !isTracked(state, turn, step)
        let outputTokens: number
        let estimated: boolean
        if (chunk.type === 'usage') {
          const reported = usageOutputTokens(chunk.usage)
          if (reported === null) return state
          // A usage chunk lands mid-stream: exact buckets supersede the estimate.
          outputTokens = reported
          estimated = false
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
          outputTokens,
          estimated,
          tokensPerSecond: rateOf(outputTokens, firstOutputTime, event.time, state.tokensPerSecond),
        }
      }
      case 'assistant/message': {
        // The stream finished: recompute with the assembled message's usage
        // (exact when reported, extending the span to the message time), then
        // settle with that as the carried rate.
        if (!isTracked(state, event.data.turn, event.data.step)) return state
        const reported = usageOutputTokens(event.data.usage)
        const outputTokens = reported !== null ? reported : state.outputTokens
        const estimated = reported !== null ? false : state.estimated
        const firstOutputTime = state.firstOutputTime ?? event.time
        const rate = rateOf(outputTokens, firstOutputTime, event.time, state.tokensPerSecond)
        return settled({ ...state, outputTokens, estimated, tokensPerSecond: rate })
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
  stateVersion: 1,
}
