/**
 * Host-side usage ledger: subscribes the global `session/event` feed, folds
 * every assistant-message's provider-reported token usage into hourly
 * buckets keyed by model, and persists the stream to a JSONL file inside
 * the plugin's local data directory so the chart survives restarts.
 */
import type { SessionEvent } from '@deepseek-ai/dsh-session';
/** One persisted usage record (one assistant message). */
export interface UsageRecord {
    /** Unix epoch ms of the assistant/message event. */
    t: number;
    model: string;
    input: number;
    cacheRead: number;
    cacheWrite: number;
    output: number;
}
/** Per-model usage within one time bucket. */
export interface BucketUsage {
    input: number;
    cacheRead: number;
    cacheWrite: number;
    output: number;
}
export type UsagePeriod = 'day' | 'week' | 'month';
export declare class UsageLedger {
    /** hourKey → model → usage. */
    private hourly;
    private readonly file;
    constructor(dataDir: string);
    private load;
    private rewriteFile;
    /** One assistant message's usage into the ledger (in-memory + append). */
    record(event: SessionEvent): void;
    private ingest;
    /**
     * Query one period's buckets. `offset` 0 = current period, 1 = previous,
     * etc. Buckets are produced in chronological order with a stable key
     * (day: 'HH:00'; week/month: 'MM-DD').
     */
    query(period: UsagePeriod, offset: number, now?: number): {
        start: number;
        end: number;
        buckets: {
            key: string;
            usage: Record<string, BucketUsage>;
        }[];
    };
}
/** Start of the current period in local time. */
export declare function periodStart(period: UsagePeriod, now?: number): number;
/**
 * Start of the period `offset` periods before the current one. Day/week
 * step by fixed milliseconds; month steps calendar months (a month is not a
 * fixed duration, so plain arithmetic would be wrong).
 */
export declare function periodStartWithOffset(period: UsagePeriod, offset: number, now?: number): number;
/** Plugin data directory: <dsh home>/dsh-status-bar. */
export declare function ledgerDataDir(envHome: string | undefined): string;
