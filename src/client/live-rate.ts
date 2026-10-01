/**
 * Live generation rate (tok/s) for the bar's TPS segment.
 *
 * 0.2.0-rc.2 removed the durable `assistant/chunk` session event, so the rate
 * can no longer be folded host-side and served over the projection registry.
 * The stream now reaches the browser as client-only `assistant/live-chunk`
 * entries inside the session's event window (`SessionEventWindow`), so the
 * fold lives here instead: the same estimator as before, driven by the
 * window's incremental `change` deltas and read by the bar through the
 * registration's `hooks` compartment (`useLiveRate`).
 *
 * Estimator semantics: per-block character accumulation priced as
 * `ceil(chars / charsPerToken)` plus a fixed framing overhead, tool calls
 * priced from name + argument characters separately, one role overhead per
 * stream once any block is priced, and a `block-end` chunk re-pricing its slot
 * from the full assembled block. A provider `usage` chunk mid-stream replaces
 * the estimate with exact `outputTokens`.
 *
 * RATE MEASUREMENT — a trailing time window, not per-chunk instants. The
 * browser receives the stream at whatever granularity the host forwards
 * (0.2.0 delivers single-token deltas, sometimes several stamped with the same
 * time), so a per-chunk instant rate divided by a floored inter-chunk interval
 * saturates: one token per chunk over a 20 ms floor can never read above
 * 50 tok/s, however fast the model is actually decoding. The estimated branch
 * therefore counts accumulated output tokens over the last
 * {@link RATE_WINDOW_MS} of stream time — `(tokens now − tokens at the window
 * base) / (now − base time)`, which is granularity-independent and converges
 * on the same figure the session's average decode rate reports. A window
 * younger than {@link MIN_SPAN_MS}, or a burst whose stamps carry no elapsed
 * time at all, falls back to the whole stream so far; a burst with a single
 * distinct timestamp keeps the carried figure rather than inventing one. The
 * exact branch (provider-reported usage) keeps the faithful stream average
 * with the same span floor. Once a stream settles the window is dropped and
 * the rate reports 0 — no active generation reads as zero instead of freezing
 * on a stale value.
 *
 * @module @bananiceee/dsh-status-bar/client-live-rate
 */

import type {
  AssistantLiveChunkEvent,
  ISessions,
  SessionEventLike,
  SessionEventLikeEntry,
  SessionEventWindow,
} from '@deepseek-ai/dsh-api-session-controller/client'
import type { ContentBlock, StreamChunk, TokenUsage } from '@deepseek-ai/dsh-llm'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Approximate text characters represented by one token (dsh-live-stats default). */
export const CHARS_PER_TOKEN = 4

/** Fixed framing tokens charged per content block (structure the tokenizer prices). */
export const BLOCK_OVERHEAD = 4

/** Fixed framing tokens charged once per stream once any block is priced (role framing). */
export const ROLE_OVERHEAD = 4

/** Trailing measurement window of the estimated branch, in stream-time ms. */
export const RATE_WINDOW_MS = 1_500

/**
 * Minimum span a measurement may divide by, in ms. Below it the fold divides
 * the whole stream instead, so a stream's first chunk cannot report a spike
 * and a burst with one distinct timestamp cannot divide by ~zero.
 */
export const MIN_SPAN_MS = 250

/** Value the bar reads: the live rate is absent until the first measurable output. */
export interface LiveTokenUsageView {
  tokensPerSecond?: number
}

/** Minimum observable face the registration hands to the bar. */
export interface LiveRateSource {
  getSnapshot(): LiveTokenUsageView
  subscribe(listener: () => void): () => void
}

declare module '@deepseek-ai/dsh-api-session-controller/client' {
  interface SessionReferenceSourceMap {
    /** This plugin's live TPS fold retains the current session for its event window. */
    statusBarLiveRate: unknown
  }
}

/**
 * One priced block slot: the accumulated characters of a text-like block, the
 * separated name/argument characters of a tool call, or the final full-block
 * estimate a `block-end` chunk installs (superseding the delta accumulation).
 */
type OutputBlock =
  | { kind: 'text' | 'reasoning'; characters: number }
  | { kind: 'tool-call'; nameCharacters: number; argumentCharacters: number }
  | { kind: 'fixed'; tokens: number }

/** Fold state: the active stream's counters plus the last measured rate. */
interface LiveRateState {
  /** Turn/step of the stream being measured; null while idle. */
  turn: number | null
  step: number | null
  /** Time of the first counted output chunk, ms. */
  firstOutputTime: number | null
  /** Time of the most recent counted output chunk, ms. */
  latestOutputTime: number | null
  /** Trailing measurement anchors (oldest first, newest last) for the rate window. */
  samples: readonly RateSample[]
  /** Output tokens: provider-reported once a `usage` chunk lands, priced estimate before. */
  outputTokens: number
  /** Last measured rate (tok/s); 0 once the stream settles. */
  tokensPerSecond: number | null
  /** Per-block accumulation for the ACTIVE stream, indexed by chunk index. */
  blocks: Array<OutputBlock | undefined>
  /** Running sum of the per-block estimates of every non-undefined block. */
  pricedTokens: number
  /** Count of non-undefined blocks (guards the role overhead and zero case). */
  pricedBlocks: number
  /** Provider-reported usage landed; further deltas neither add tokens nor extend the span. */
  exact: boolean
}

/** The idle state every settle lands on (window dropped, rate reported as 0). */
function settled(): LiveRateState {
  return {
    turn: null,
    step: null,
    firstOutputTime: null,
    latestOutputTime: null,
    samples: [],
    outputTokens: 0,
    tokensPerSecond: 0,
    blocks: [],
    pricedTokens: 0,
    pricedBlocks: 0,
    exact: false,
  }
}

/** Fresh state before any output: no rate measured yet (the segment hides). */
function idle(): LiveRateState {
  return { ...settled(), tokensPerSecond: null }
}

/** The current stream is the one tracked by the fold state. */
function isTracked(state: LiveRateState, turn: number, step: number): boolean {
  return state.turn === turn && state.step === step
}

/** Provider-reported output tokens, guarded the way the stats fold guards node usage. */
function usageOutputTokens(usage: TokenUsage | undefined): number | null {
  if (usage === undefined) return null
  const value = usage.outputTokens
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

/** One measurement anchor: cumulative output tokens as of a stream time. */
interface RateSample {
  time: number
  tokens: number
}

/**
 * Append one sample and drop everything that fell out of the trailing window,
 * keeping exactly one sample at or before the cutoff as the window base (the
 * rate then divides real tokens by real elapsed time across the whole window).
 */
function pushSample(samples: readonly RateSample[], sample: RateSample): RateSample[] {
  const next = [...samples, sample]
  const cutoff = sample.time - RATE_WINDOW_MS
  let base = 0
  while (base + 2 < next.length && (next[base + 1]?.time ?? Number.POSITIVE_INFINITY) <= cutoff) base += 1
  return base === 0 ? next : next.slice(base)
}

/**
 * Estimated generation rate over the trailing window: real accumulated tokens
 * over real elapsed stream time, so the figure does not depend on how finely
 * the host forwarded the stream. Falls back to the whole stream while the
 * window is younger than MIN_SPAN_MS; returns the carried rate when the
 * available stamps carry no elapsed time at all (a single-timestamp burst).
 */
function windowRate(
  samples: readonly RateSample[],
  firstOutputTime: number,
  outputTokens: number,
  nowTime: number,
  carried: number | null,
): number | null {
  const base = samples[0]
  let tokens = base === undefined ? outputTokens : outputTokens - base.tokens
  let span = base === undefined ? 0 : nowTime - base.time
  if (span < MIN_SPAN_MS) {
    tokens = outputTokens
    span = nowTime - firstOutputTime
  }
  if (span <= 0) return carried
  return Math.round(tokens * 1_000 / span * 10) / 10
}

/** Window average for the exact branch: real tokens over real elapsed time, span-floored. */
function spanRateOf(outputTokens: number, firstTime: number, nowTime: number): number {
  const span = Math.max(nowTime - firstTime, MIN_SPAN_MS)
  return Math.round(outputTokens * 1_000 / span * 10) / 10
}

const MAX_UNKNOWN_BLOCK_CHARS = 4096

function estimateTextBlockTokens(characters: number): number {
  return Math.ceil(characters / CHARS_PER_TOKEN) + BLOCK_OVERHEAD
}

function estimateToolCallBlockTokens(nameCharacters: number, argumentCharacters: number): number {
  return Math.ceil(nameCharacters / CHARS_PER_TOKEN)
    + Math.ceil(argumentCharacters / CHARS_PER_TOKEN)
    + BLOCK_OVERHEAD
}

function estimateUnknownBlockTokens(block: ContentBlock): number {
  const serialized = JSON.stringify(block)
  const length = serialized.length > MAX_UNKNOWN_BLOCK_CHARS
    ? MAX_UNKNOWN_BLOCK_CHARS
    : serialized.length
  return BLOCK_OVERHEAD + Math.ceil(length / CHARS_PER_TOKEN)
}

function estimateContentTokens(blocks: readonly ContentBlock[]): number {
  let tokens = 0
  for (const block of blocks) {
    switch (block.type) {
      case 'text':
      case 'reasoning':
        tokens += estimateTextBlockTokens(block.text.length)
        break
      case 'tool-call':
        tokens += estimateToolCallBlockTokens(block.name.length, block.arguments.length)
        break
      default:
        tokens += estimateUnknownBlockTokens(block)
    }
  }
  return tokens
}

/** Per-block estimate of one priced slot (what `write` diffs against). */
function blockEstimate(block: OutputBlock): number {
  switch (block.kind) {
    case 'text':
    case 'reasoning':
      return estimateTextBlockTokens(block.characters)
    case 'tool-call':
      return estimateToolCallBlockTokens(block.nameCharacters, block.argumentCharacters)
    case 'fixed':
      return block.tokens
  }
}

/**
 * Incremental output pricing: apply one stream chunk to the block book and
 * return the MARGINAL token estimate it added. The first delta of a block
 * charges its framing overhead; later deltas charge only the character growth
 * crossing a `charsPerToken` boundary, so a fragmented delta stream cannot
 * inflate the figure. A `block-end` chunk replaces its slot with the
 * full-block estimate. Non-output chunks and empty deltas are no-ops and
 * return null — the fold then leaves the state untouched.
 */
function applyOutputChunk(
  book: { blocks: Array<OutputBlock | undefined>; pricedTokens: number; pricedBlocks: number },
  chunk: StreamChunk,
): number | null {
  const write = (index: number, build: (previous: OutputBlock | undefined) => OutputBlock): number => {
    const previous = book.blocks[index] ?? undefined
    const next = build(previous)
    const before = previous === undefined ? 0 : blockEstimate(previous)
    const after = blockEstimate(next)
    book.blocks[index] = next
    book.pricedTokens += after - before
    if (previous === undefined) book.pricedBlocks += 1
    return after - before
  }
  switch (chunk.type) {
    case 'text-delta':
      if (chunk.text === '') return null
      return write(chunk.index, previous => ({
        kind: 'text',
        characters: (previous?.kind === 'text' ? previous.characters : 0) + chunk.text.length,
      }))
    case 'reasoning-delta':
      if (chunk.text === '') return null
      return write(chunk.index, previous => ({
        kind: 'reasoning',
        characters: (previous?.kind === 'reasoning' ? previous.characters : 0) + chunk.text.length,
      }))
    case 'tool-call-delta':
      if (chunk.name === undefined && chunk.argumentsDelta === '') return null
      return write(chunk.index, previous => ({
        kind: 'tool-call',
        nameCharacters: chunk.name?.length ?? (previous?.kind === 'tool-call' ? previous.nameCharacters : 0),
        argumentCharacters: (previous?.kind === 'tool-call' ? previous.argumentCharacters : 0)
          + chunk.argumentsDelta.length,
      }))
    case 'block-end':
      return write(chunk.index, () => ({ kind: 'fixed', tokens: estimateContentTokens([chunk.block]) }))
    default:
      return null
  }
}

/** Plugin-merged retry marker: not in the static SessionEvent union, matched structurally. */
function isRetryMarker(event: SessionEventLike): boolean {
  return (event as { type?: string }).type === 'llm/retry'
}

/**
 * The bar's live-rate source. One instance per client plugin registration; the
 * bar starts and stops the session watch through `watch`.
 */
export class LiveRateStore implements LiveRateSource {
  private state: LiveRateState = idle()
  private snapshot: LiveTokenUsageView = {}
  private readonly listeners = new Set<() => void>()

  getSnapshot(): LiveTokenUsageView {
    return this.snapshot
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /**
   * Retain one session and follow its event window until the returned stop
   * function runs. The window's transient `assistant/live-chunk` entries are
   * the stream this fold measures; durable `assistant/message`, `step/end`,
   * `turn/end` and the merged retry marker close or restart the window.
   */
  watch(sessions: ISessions, sessionId: SessionId): () => void {
    const reference = sessions.retain(sessionId, { source: 'statusBarLiveRate' })
    const source = reference.binding.eventSource
    this.seed(source.getSnapshot())
    const off = source.subscribe(() => { this.accept(source.getSnapshot()) })
    return () => {
      off()
      reference.release()
    }
  }

  /** Drop the measured window (plugin teardown). */
  reset(): void {
    this.state = idle()
    this.publish()
  }

  /** Fold one window revision through its incremental delta. */
  accept(window: SessionEventWindow): void {
    const change = window.change
    switch (change.kind) {
      case 'append':
        for (const entry of change.entries) this.applyEntry(entry)
        break
      case 'replace':
        this.state = idle()
        for (const entry of window.entries) this.applyEntry(entry)
        break
      case 'settle-assistant':
        // The durable settlement supersedes one attempt's transient rows; the
        // fold only needs the committed event (its transient chunks are
        // already accumulated).
        if (change.entry !== undefined) this.applyEntry(change.entry)
        break
      case 'prepend':
        // Older history cannot change a live-rate window.
        break
    }
    this.publish()
  }

  /** First read: fold the whole current window, ignoring its `change` delta. */
  private seed(window: SessionEventWindow): void {
    this.state = idle()
    for (const entry of window.entries) this.applyEntry(entry)
    this.publish()
  }

  private publish(): void {
    const next: LiveTokenUsageView = this.state.tokensPerSecond === null
      ? {}
      : { tokensPerSecond: this.state.tokensPerSecond }
    if (next.tokensPerSecond === this.snapshot.tokensPerSecond) return
    this.snapshot = next
    for (const listener of [...this.listeners]) listener()
  }

  private applyEntry(entry: SessionEventLikeEntry): void {
    const event = entry.event
    if (event.type === 'assistant/live-chunk') {
      this.applyChunk(event)
      return
    }
    switch (event.type) {
      case 'assistant/message': {
        // The stream finished: settle — the bar reports 0 while no stream is
        // active instead of freezing on the last measured figure.
        if (isTracked(this.state, event.data.turn, event.data.step)) this.state = settled()
        break
      }
      case 'step/end': {
        // A step closed without a message (cancelled) settles the same way.
        if (isTracked(this.state, event.data.turn, event.data.step)) this.state = settled()
        break
      }
      case 'turn/end':
        if (this.state.turn !== null) this.state = settled()
        break
      default:
        // A retry restarts the attempt under the SAME (turn, step) with no
        // boundary in between; without a reset every attempt's tokens would
        // keep accumulating into one window and the rate would climb while the
        // agent is stuck retrying. The measured rate is carried across the
        // short retry wait so the figure does not flicker to 0.
        if (isRetryMarker(event) && this.state.turn !== null) {
          const data = (event as { data?: { turn?: unknown; step?: unknown } }).data
          if (data?.turn === this.state.turn && data?.step === this.state.step) {
            this.state = { ...settled(), turn: this.state.turn, step: this.state.step, tokensPerSecond: this.state.tokensPerSecond }
          }
        }
        break
    }
  }

  /** One live chunk: either the provider's exact usage or one output delta. */
  private applyChunk(event: AssistantLiveChunkEvent): void {
    const { turn, step, chunk } = event.data
    const time = event.time
    const state = this.state
    const fresh = !isTracked(state, turn, step)
    if (chunk.type === 'usage') {
      const reported = usageOutputTokens(chunk.usage)
      if (reported === null) return
      // Exact buckets supersede the estimate; the rate is the faithful stream
      // average (provider tokens over real elapsed time), span-floored.
      const first = fresh || state.firstOutputTime === null ? time : state.firstOutputTime
      this.state = {
        ...state,
        turn,
        step,
        firstOutputTime: first,
        latestOutputTime: time,
        samples: [],
        outputTokens: reported,
        exact: true,
        blocks: [],
        pricedTokens: 0,
        pricedBlocks: 0,
        tokensPerSecond: spanRateOf(reported, first, time),
      }
      return
    }
    // Once the provider reported exact usage for the CURRENT window, further
    // deltas neither add tokens nor extend the span — the exact rate must not
    // be diluted. A retry reset zeroes the window, so exactness starts over.
    if (!fresh && state.exact) return
    const book = {
      blocks: [...state.blocks],
      pricedTokens: state.pricedTokens,
      pricedBlocks: state.pricedBlocks,
    }
    const added = applyOutputChunk(book, chunk)
    if (added === null) return
    // Role framing: one fixed overhead per response once any block is priced.
    const outputTokens = book.pricedBlocks === 0 ? 0 : book.pricedTokens + ROLE_OVERHEAD
    const firstOutputTime = state.firstOutputTime === null ? time : state.firstOutputTime
    if (added <= 0) {
      // A block-end reprice corrected the total without adding tokens: keep
      // the rate and the measurement anchors exactly where they are.
      this.state = {
        ...state,
        turn,
        step,
        blocks: book.blocks,
        pricedTokens: book.pricedTokens,
        pricedBlocks: book.pricedBlocks,
        firstOutputTime,
        outputTokens,
      }
      return
    }
    // One anchor per counted delta; the rate is read off the trailing window.
    const samples = pushSample(state.samples, { time, tokens: outputTokens })
    this.state = {
      ...state,
      turn,
      step,
      blocks: book.blocks,
      pricedTokens: book.pricedTokens,
      pricedBlocks: book.pricedBlocks,
      firstOutputTime,
      latestOutputTime: time,
      samples,
      outputTokens,
      tokensPerSecond: windowRate(samples, firstOutputTime, outputTokens, time, state.tokensPerSecond),
    }
  }
}
