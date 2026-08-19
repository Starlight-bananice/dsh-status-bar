/**
 * `liveTokenUsage` projection unit: the real-time generation rate of the
 * session's CURRENT stream, served to the bar over the session-projection
 * channel — DSH's live-state path from host to browser.
 *
 * The unit folds `assistant/chunk` events as they commit: each output delta
 * (text / reasoning / tool-call) contributes an estimated token count and
 * refreshes the measurement window, so the change feed fires once per chunk
 * and the client's `useProjection('liveTokenUsage')` re-renders the TPS
 * segment while the stream is hot (the bar throttles the displayed figure to
 * at most two refreshes per second). When the provider reports a `usage`
 * chunk mid-stream the estimate is replaced by the exact `outputTokens`, and
 * the rate is then provider-accurate.
 *
 * Output estimation is block-aware (approach learned from `dsh-live-stats`
 * in the dsh-web-ui family): per-block character accumulation priced as
 * `ceil(chars / charsPerToken)` plus a per-block framing overhead, tool
 * calls priced from name + argument characters separately, one role overhead
 * per stream once any block is priced, and a `block-end` chunk re-prices its
 * slot from the full assembled block (so a fragmented delta stream never
 * inflates the figure and non-text blocks — image, tool-result — are priced
 * from their bounded JSON). A single-character stream still measures: the
 * first delta of a block always crosses the framing overhead.
 *
 * Rate semantics: tokens accumulated since the stream's first output token
 * divided by that span (a running average, not an instant sample), rounded to
 * one decimal. Once a stream settles (`assistant/message`, `step/end`, or
 * `turn/end`) the active window is dropped and the rate reports **0** — no
 * active stream means no generation, so the bar's TPS segment falls to zero
 * the moment the agent stops producing instead of freezing on a stale value.
 *
 * Two hazards are folded explicitly:
 *
 * - The agent loop retries a failed stream under the SAME (turn, step) with
 *   no boundary event in between, so the log's `llm/retry` marker
 *   (plugin-merged, structurally matched) resets the measurement window —
 *   without it every retry attempt's tokens would keep accumulating into one
 *   window and the rate would climb while the agent is stuck retrying.
 *
 * - The estimator's own clock: providers flush deltas in bursts (tool-call
 *   JSON arguments arrive with dt≈0–2 ms, and the persistence layer can
 *   batch-flush), so a plain running average over the window span climbs
 *   without bound during a burst — tokens keep accruing while
 *   `latest - first` stays frozen. The estimated branch therefore uses an
 *   EWMA over per-chunk INSTANT rates with a minimum inter-chunk interval
 *   (burst deltas are treated as spaced at MIN_DT_MS), which bounds the
 *   displayed figure to the real generation envelope; the exact branch
 *   (provider-reported usage) keeps the window average, which is faithful
 *   there, with a minimum span floor.
 *
 * The fold is pure over the durable log (event `time` is the only clock), so
 * replay, restore, and the persisted projection cache all reproduce the same
 * values — no wall clock enters the state.
 *
 * @module dsh-status-bar/live-rate
 */
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';
/** Approximate text characters represented by one token (dsh-live-stats default). */
export declare const CHARS_PER_TOKEN = 4;
/** Fixed framing tokens charged per content block (structure the tokenizer prices). */
export declare const BLOCK_OVERHEAD = 4;
/** Fixed framing tokens charged once per stream once any block is priced (role framing). */
export declare const ROLE_OVERHEAD = 4;
/**
 * Minimum inter-chunk interval for the estimated branch's instant rate.
 * Providers flush bursts (tool-call arguments, batched deltas) with dt≈0,
 * so a raw dt would report absurd rates; burst deltas are treated as spaced
 * at this floor instead. 20 ms bounds a burst to the real generation
 * envelope (measured: ≤ ~360 tok/s on real sessions) while genuine
 * high-speed streaming still reads through.
 */
export declare const MIN_DT_MS = 20;
/** Minimum window span for the exact (provider-reported) branch's average. */
export declare const MIN_SPAN_MS = 250;
/**
 * EWMA weight of the newest instant rate (0..1); higher = more responsive.
 * 0.6 keeps the figure snappy (≈2 chunks to a 90% step) while the instant
 * rate's dt floor still damps burst noise.
 */
export declare const EWMA_ALPHA = 0.6;
/** Wire value: the live rate is absent until the first measurable output. */
export interface LiveTokenUsageView {
    tokensPerSecond?: number;
}
/**
 * One priced block slot: the accumulated characters of a text-like block, the
 * separated name/argument characters of a tool call, or the final full-block
 * estimate a `block-end` chunk installs (superseding the delta accumulation).
 */
type OutputBlock = {
    kind: 'text' | 'reasoning';
    characters: number;
} | {
    kind: 'tool-call';
    nameCharacters: number;
    argumentCharacters: number;
} | {
    kind: 'fixed';
    tokens: number;
};
/**
 * Fold state: the active stream's counters plus the last measured rate.
 * Plain JSON per the unit contract (persisted-cache precondition) — the
 * block slots are a plain array (holes restore as `null` and are treated as
 * absent).
 */
interface LiveRateState {
    /** Turn/step of the stream being measured; null while idle. */
    turn: number | null;
    step: number | null;
    /** Event time of the first counted output chunk, ms. */
    firstOutputTime: number | null;
    /** Event time of the most recent counted output chunk, ms. */
    latestOutputTime: number | null;
    /** Event time of the previous counted output chunk, ms (inter-chunk dt for the instant rate). */
    prevOutputTime: number | null;
    /** Output tokens: provider-reported once a `usage` chunk lands, priced estimate before. */
    outputTokens: number;
    /** Whether `outputTokens` is still an estimate. */
    estimated: boolean;
    /** Last measured rate (tok/s); 0 once the stream settles (no active generation). */
    tokensPerSecond: number | null;
    /** Per-block accumulation for the ACTIVE stream, indexed by chunk index. */
    blocks: Array<OutputBlock | undefined>;
    /** Running sum of the per-block estimates of every non-undefined block. */
    pricedTokens: number;
    /** Count of non-undefined blocks (guards the role overhead and zero case). */
    pricedBlocks: number;
    /** Provider-reported usage landed; further deltas neither add tokens nor extend the span. */
    exact: boolean;
}
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionMap {
        /** Real-time generation throughput (tok/s) of the current stream, folded by this plugin's host side. */
        liveTokenUsage: LiveTokenUsageView;
    }
}
/**
 * The `liveTokenUsage` unit registered on `ctx.sessionProjections` (exported
 * for the unit spec). Only `assistant/chunk` and the stream-closing events
 * change the state reference, so the change feed stays quiet otherwise.
 */
export declare const liveTokenUsageProjectionDefinition: ProjectionDefinition<'liveTokenUsage', LiveRateState>;
export {};
