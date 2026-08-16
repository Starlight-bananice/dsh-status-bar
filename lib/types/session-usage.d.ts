/**
 * `sessionUsage` projection unit: the whole session's token usage, folded
 * across every committed assistant/message event. Unlike `sessionModel`
 * (which keeps only the LAST model), this fold aggregates tokens PER MODEL
 * (keyed by model id) and remembers each sequence number's model identity
 * and wall-clock time (`bySeq`). That per-step model + timestamp lets the
 * client price each step with the model that actually produced it, applying
 * that model's peak/off-peak schedule at the step's own time.
 */
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';
/** Aggregated whole-session usage per model plus a per-step model ledger. */
export interface SessionUsageState {
    /** model id → whole-session token buckets across that model's messages. */
    models: Record<string, {
        input: number;
        cacheRead: number;
        cacheWrite: number;
        output: number;
    }>;
    /** String(event.seq) → the model/provid/time of the step that produced it. */
    bySeq: Record<string, {
        provider: string;
        model: string;
        time: number;
    }>;
}
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionMap {
        /** Whole-session per-model usage plus the per-step model/time ledger. */
        sessionUsage: SessionUsageState;
    }
}
export declare const sessionUsageProjectionDefinition: ProjectionDefinition<'sessionUsage', SessionUsageState>;
