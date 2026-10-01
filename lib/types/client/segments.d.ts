/**
 * Segment computation: pure functions folding session/projection data into
 * display views. Each segment returns null when its data is absent, so the
 * bar only ever shows live facts (and the manager UI can preview segments
 * that are currently hidden for lack of data).
 */
import type { SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client';
import type { LegacyConversationSlice } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { JobView } from '@deepseek-ai/dsh-jobs/view';
import type { SessionStatsProjection } from '@deepseek-ai/dsh-session-stats/client';
import type { ContextPressureProjection, TokenUsageProjection } from '@deepseek-ai/dsh-token-meter/client';
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import { type CostPrices, type StatusBarConfig, type SegmentId } from './config.ts';
import type { NS } from './locales.ts';
import type { HolidayCalendar, HolidayOverride } from './pricing-types.ts';
import { type BillingReason, type DayFacts, type HolidayIndex } from './timezone.ts';
import { type PricingContext, type SessionUsageClientState } from './session-usage-cost.ts';
export type StatusState = 'running' | 'idle' | 'error';
export interface SegmentView {
    id: SegmentId;
    /** Status segment only: drives the leading state dot. */
    state?: StatusState;
    text: string;
}
/** Last model identity (projection first, node provider metadata as fallback). */
export interface ModelIdentity {
    provider: string;
    model: string;
}
export interface SegmentSource {
    /** Settled-message slice of the Chat view: nodes, turn timings, partial, running calls. */
    chat: LegacyConversationSlice;
    /** Session lifecycle facts the bar reads (both from the Session snapshot). */
    session: {
        running: boolean;
        lastAgentError: string | null;
    };
    /** Messages still waiting for their own turn (composer inbox). */
    queueLength: number;
    /** Whole-log projection, or the window fold when the unit is absent. */
    stats: SessionStatsProjection | null;
    usage: TokenUsageProjection | undefined;
    pressure: ContextPressureProjection | undefined;
    /** Live generation rate from this plugin's client-side stream fold (absent while idle). */
    liveRate: number | undefined;
    /** Last model identity from the host-side sessionModel projection. */
    sessionModel: ModelIdentity | undefined;
    /** Per-model usage + per-step model map from the host sessionUsage projection. */
    sessionUsage: SessionUsageClientState | undefined;
    jobs: readonly JobView[] | undefined;
    summary: SessionSummary | undefined;
    /** Wall-clock now (ticked by the bar while it renders sessionTime). */
    now: number;
}
type T = TranslateNS<typeof NS>;
/**
 * Window-scoped fallback fold over the snapshot's settled nodes — mirrors the
 * shipped stats line's fallback so assemblies without the `sessionStats`
 * projection still get counts and wall times.
 */
export declare function deriveWindowStats(chat: LegacyConversationSlice): SessionStatsProjection;
/** Billed prompt-side tokens (the three disjoint buckets). */
export declare function billedInputTokens(usage: TokenUsageProjection): number;
/**
 * Last model identity: the host `sessionModel` projection when served,
 * falling back to the window's last assistant node's provider metadata (the
 * shipped assembly omits it, so the projection is the live path).
 */
export declare function lastModel(chat: LegacyConversationSlice, sessionModel: ModelIdentity | undefined): ModelIdentity | null;
/** Failed/retried steps visible in the window (durable notices + turn errors). */
export declare function errorCount(chat: LegacyConversationSlice): number;
/** Live background jobs (running/stopping) for the session, if the mirror serves them. */
export declare function liveJobCount(jobs: readonly JobView[] | undefined): number;
/** Session wall time: first turn start → last turn end (or now while running). */
export declare function sessionElapsed(chat: LegacyConversationSlice, now: number): number | null;
/**
 * Fold every enabled segment into display views, in the user's configured
 * order. Segments whose data is absent drop out entirely.
 */
export declare function buildSegments(source: SegmentSource, config: StatusBarConfig, t: T): SegmentView[];
/**
 * Effective input/output/cache prices per 1M tokens for the current model,
 * straight from the user-maintained price book (each model has its own
 * prices and peak schedule). Returns null when the model has no entry —
 * the cost segment then hides instead of guessing.
 *
 * When the model's peak/off-peak billing is on, the peak/off-peak input,
 * cache-hit, and output prices replace the flat rates. Which tier applies is
 * decided by {@link resolveBilling}: a working day inside one of the model's
 * windows is peak, everything else — nights, weekends, holidays and 调休 rest
 * days — is off-peak. `reason` says which of those it was, for the badges.
 */
export declare function effectivePrices(model: ModelIdentity | null, cost: CostPrices, now: number, dayRules?: boolean, calendars?: readonly HolidayCalendar[], overrides?: readonly HolidayOverride[], index?: HolidayIndex): {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    source: 'flat' | 'peak' | 'offpeak';
    reason: BillingReason | null;
    day: DayFacts;
} | null;
/** Cost of one token-usage record at the given per-1M-token prices. */
export declare function costOfUsage(usage: {
    uncachedInputTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    outputTokens: number;
}, prices: {
    input: number;
    cacheRead: number;
    cacheWrite: number;
    output: number;
}): number;
/** One row of the usage-history table (provider-reported per-step usage). */
export interface UsageHistoryRow {
    seq: number;
    time: number;
    model: string | null;
    input: number;
    /** Cache-hit tokens of this step (priced at the model's cacheRead rate). */
    cacheRead: number;
    /** Cache-write tokens of this step (priced at the model's cacheWrite rate). */
    cacheWrite: number;
    output: number;
    cost: number | null;
}
/**
 * Recent per-step usage rows from the settled window: the last assistant
 * nodes that carried provider-reported usage, newest first. Each step's cost
 * is priced with the model that ACTUALLY produced that step (from the host
 * `sessionUsage` fold, node provider metadata as fallback), applying that
 * model's own price-book entry (with peak/off-peak) at the step's wall-clock
 * time.
 */
export declare function usageHistory(chat: LegacyConversationSlice, state: SessionUsageClientState | undefined, cost: CostPrices, limit?: number, context?: PricingContext): UsageHistoryRow[];
export {};
//# sourceMappingURL=segments.d.ts.map