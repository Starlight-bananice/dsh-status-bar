/**
 * `sessionModel` projection unit: the last model/provider that produced an
 * assistant message. The client snapshot's assistant nodes do not carry
 * provenance, so the bar reads this projection instead of walking nodes.
 */
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';
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
}
export declare const sessionModelProjectionDefinition: ProjectionDefinition<'sessionModel', SessionModelState>;
