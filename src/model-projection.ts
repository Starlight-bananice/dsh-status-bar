/**
 * `sessionModel` projection unit: the last model/provider that produced an
 * assistant message. The client snapshot's assistant nodes do not carry
 * provenance, so the bar reads this projection instead of walking nodes.
 */

import { z } from 'zod'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'

/** Latest model identity plus when it was last seen. */
export interface SessionModelState {
  provider: string | null
  model: string | null
  updatedAt: number | null
}

const sessionModelSchema = z.object({
  provider: z.string().nullable(),
  model: z.string().nullable(),
  updatedAt: z.number().nullable(),
}).strict()

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Last assistant-message model identity (null until the first message). */
    sessionModel: SessionModelState
  }
}

export const sessionModelProjectionDefinition:
ProjectionDefinition<'sessionModel', SessionModelState> = {
  key: 'sessionModel',
  schema: sessionModelSchema,
  init: () => ({ provider: null, model: null, updatedAt: null }),
  apply: (state, event) => {
    if (event.type !== 'assistant/message') return state
    const source = event.data.message.source
    if (source.kind !== 'model') return state
    const { provider, model } = source
    if (provider === state.provider && model === state.model) return state
    return { provider, model, updatedAt: event.time }
  },
  view: state => state,
  stateVersion: 1,
}
