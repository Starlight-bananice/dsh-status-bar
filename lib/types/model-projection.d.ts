/**
 * `sessionModel` projection unit: the last model/provider that produced an
 * assistant message. The client snapshot's assistant nodes do not carry
 * provenance, so the bar reads this projection instead of walking nodes.
 */
import { z } from 'zod';
/** Latest model identity plus when it was last seen. */
export interface SessionModelState {
    provider: string | null;
    model: string | null;
    updatedAt: number | null;
}
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionMap {
        /** Last assistant-message model identity (null until the first message). */
        sessionModel: SessionModelState;
    }
    interface SessionProjectionStateMap {
        /** Host fold state; the wire value is the state itself (view = identity). */
        sessionModel: SessionModelState;
    }
}
export declare const sessionModelProjectionDefinition: {
    key: "sessionModel";
    stateSchema: z.ZodObject<{
        provider: z.ZodNullable<z.ZodString>;
        model: z.ZodNullable<z.ZodString>;
        updatedAt: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>;
    init: () => {
        provider: null;
        model: null;
        updatedAt: null;
    };
    apply: (state: NoInfer<SessionModelState>, event: import("@deepseek-ai/dsh-session").SessionEvent) => SessionModelState;
    wire: {
        viewSchema: z.ZodObject<{
            provider: z.ZodNullable<z.ZodString>;
            model: z.ZodNullable<z.ZodString>;
            updatedAt: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        view: (state: NoInfer<SessionModelState>) => SessionModelState;
    };
    stateVersion: number;
};
