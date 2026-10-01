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
import type { ISessions, SessionEventWindow } from '@deepseek-ai/dsh-api-session-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Approximate text characters represented by one token (dsh-live-stats default). */
export declare const CHARS_PER_TOKEN = 4;
/** Fixed framing tokens charged per content block (structure the tokenizer prices). */
export declare const BLOCK_OVERHEAD = 4;
/** Fixed framing tokens charged once per stream once any block is priced (role framing). */
export declare const ROLE_OVERHEAD = 4;
/** Trailing measurement window of the estimated branch, in stream-time ms. */
export declare const RATE_WINDOW_MS = 1500;
/**
 * Minimum span a measurement may divide by, in ms. Below it the fold divides
 * the whole stream instead, so a stream's first chunk cannot report a spike
 * and a burst with one distinct timestamp cannot divide by ~zero.
 */
export declare const MIN_SPAN_MS = 250;
/** Value the bar reads: the live rate is absent until the first measurable output. */
export interface LiveTokenUsageView {
    tokensPerSecond?: number;
}
/** Minimum observable face the registration hands to the bar. */
export interface LiveRateSource {
    getSnapshot(): LiveTokenUsageView;
    subscribe(listener: () => void): () => void;
}
declare module '@deepseek-ai/dsh-api-session-controller/client' {
    interface SessionReferenceSourceMap {
        /** This plugin's live TPS fold retains the current session for its event window. */
        statusBarLiveRate: unknown;
    }
}
/**
 * The bar's live-rate source. One instance per client plugin registration; the
 * bar starts and stops the session watch through `watch`.
 */
export declare class LiveRateStore implements LiveRateSource {
    private state;
    private snapshot;
    private readonly listeners;
    getSnapshot(): LiveTokenUsageView;
    subscribe(listener: () => void): () => void;
    /**
     * Retain one session and follow its event window until the returned stop
     * function runs. The window's transient `assistant/live-chunk` entries are
     * the stream this fold measures; durable `assistant/message`, `step/end`,
     * `turn/end` and the merged retry marker close or restart the window.
     */
    watch(sessions: ISessions, sessionId: SessionId): () => void;
    /** Drop the measured window (plugin teardown). */
    reset(): void;
    /** Fold one window revision through its incremental delta. */
    accept(window: SessionEventWindow): void;
    /** First read: fold the whole current window, ignoring its `change` delta. */
    private seed;
    private publish;
    private applyEntry;
    /** One live chunk: either the provider's exact usage or one output delta. */
    private applyChunk;
}
//# sourceMappingURL=live-rate.d.ts.map