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
 * Estimator semantics (unchanged from the host unit this replaces):
 * per-block character accumulation priced as `ceil(chars / charsPerToken)`
 * plus a fixed framing overhead, tool calls priced from name + argument
 * characters separately, one role overhead per stream once any block is
 * priced, and a `block-end` chunk re-pricing its slot from the full assembled
 * block. A provider `usage` chunk mid-stream replaces the estimate with exact
 * `outputTokens`. The estimated branch smooths per-chunk INSTANT rates with an
 * EWMA and a minimum inter-chunk interval (providers flush bursts with dt≈0);
 * the exact branch keeps the faithful window average with a span floor. Once
 * a stream settles the window is dropped and the rate reports 0 — no active
 * generation reads as zero instead of freezing on a stale value.
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
/** Minimum inter-chunk interval for the estimated branch's instant rate. */
export declare const MIN_DT_MS = 20;
/** Minimum window span for the exact (provider-reported) branch's average. */
export declare const MIN_SPAN_MS = 250;
/** EWMA weight of the newest instant rate (0..1); higher = more responsive. */
export declare const EWMA_ALPHA = 0.6;
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