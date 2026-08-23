/**
 * `sessionUsage` projection unit: the whole session's token usage, folded
 * across every committed assistant/message event. Unlike `sessionModel`
 * (which keeps only the LAST model), this fold aggregates tokens PER MODEL
 * (keyed by model id) and remembers each sequence number's model identity
 * and wall-clock time (`bySeq`). That per-step model + timestamp lets the
 * client price each step with the model that actually produced it, applying
 * that model's peak/off-peak schedule at the step's own time.
 */
import { z } from 'zod';
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
    interface SessionProjectionStateMap {
        /** Host fold state; the wire value is the state itself (view = identity). */
        sessionUsage: SessionUsageState;
    }
}
export declare const sessionUsageProjectionDefinition: {
    key: "sessionUsage";
    stateSchema: z.ZodObject<{
        models: z.ZodRecord<z.ZodString, z.ZodObject<{
            input: z.ZodNumber;
            cacheRead: z.ZodNumber;
            cacheWrite: z.ZodNumber;
            output: z.ZodNumber;
        }, z.core.$strict>>;
        bySeq: z.ZodRecord<z.ZodString, z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            time: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    init: () => {
        models: {};
        bySeq: {};
    };
    apply: (state: NoInfer<SessionUsageState>, event: import("@deepseek-ai/dsh-session").SessionEvent) => SessionUsageState;
    wire: {
        viewSchema: z.ZodObject<{
            models: z.ZodRecord<z.ZodString, z.ZodObject<{
                input: z.ZodNumber;
                cacheRead: z.ZodNumber;
                cacheWrite: z.ZodNumber;
                output: z.ZodNumber;
            }, z.core.$strict>>;
            bySeq: z.ZodRecord<z.ZodString, z.ZodObject<{
                provider: z.ZodString;
                model: z.ZodString;
                time: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        view: (state: NoInfer<SessionUsageState>) => SessionUsageState;
    };
    stateVersion: number;
};
