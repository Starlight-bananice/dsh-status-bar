/**
 * `sessionModel` projection unit: the last model/provider that produced an
 * assistant message. The client snapshot's assistant nodes do not carry
 * provenance, so the bar reads this projection instead of walking nodes.
 */
import { z } from 'zod';
const sessionModelSchema = z.object({
    provider: z.string().nullable(),
    model: z.string().nullable(),
    updatedAt: z.number().nullable(),
}).strict();
export const sessionModelProjectionDefinition = {
    key: 'sessionModel',
    schema: sessionModelSchema,
    init: () => ({ provider: null, model: null, updatedAt: null }),
    apply: (state, event) => {
        if (event.type !== 'assistant/message')
            return state;
        const source = event.data.message.source;
        if (source.kind !== 'model')
            return state;
        const { provider, model } = source;
        if (provider === state.provider && model === state.model)
            return state;
        return { provider, model, updatedAt: event.time };
    },
    view: state => state,
    stateVersion: 1,
};
//# sourceMappingURL=model-projection.js.map