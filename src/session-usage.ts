/**
 * `sessionUsage` projection unit: the whole session's token usage, folded
 * across every committed assistant/message event. Unlike `sessionModel`
 * (which keeps only the LAST model), this fold aggregates tokens PER MODEL
 * (keyed by model id) and remembers each sequence number's model identity
 * and wall-clock time (`bySeq`). That per-step model + timestamp lets the
 * client price each step with the model that actually produced it, applying
 * that model's peak/off-peak schedule at the step's own time.
 */

import { z } from 'zod'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'

/** Aggregated whole-session usage per model plus a per-step model ledger. */
export interface SessionUsageState {
  /** model id → whole-session token buckets across that model's messages. */
  models: Record<string, {
    input: number
    cacheRead: number
    cacheWrite: number
    output: number
  }>
  /** String(event.seq) → the model/provid/time of the step that produced it. */
  bySeq: Record<string, {
    provider: string
    model: string
    time: number
  }>
}

const sessionUsageSchema = z.object({
  models: z.record(z.string(), z.object({
    input: z.number(),
    cacheRead: z.number(),
    cacheWrite: z.number(),
    output: z.number(),
  }).strict()),
  bySeq: z.record(z.string(), z.object({
    provider: z.string(),
    model: z.string(),
    time: z.number(),
  }).strict()),
}).strict()

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Whole-session per-model usage plus the per-step model/time ledger. */
    sessionUsage: SessionUsageState
  }
}

export const sessionUsageProjectionDefinition:
ProjectionDefinition<'sessionUsage', SessionUsageState> = {
  key: 'sessionUsage',
  schema: sessionUsageSchema,
  init: () => ({ models: {}, bySeq: {} }),
  apply: (state, event) => {
    if (event.type !== 'assistant/message') return state
    const usage = event.data.usage
    if (usage === undefined) return state
    const source = event.data.message.source
    if (source.kind !== 'model') return state

    const { model, provider } = source
    const current = state.models[model]
    const nextModel = {
      input: (current?.input ?? 0) + usage.inputTokens,
      cacheRead: (current?.cacheRead ?? 0) + (usage.cacheReadTokens ?? 0),
      cacheWrite: (current?.cacheWrite ?? 0) + (usage.cacheWriteTokens ?? 0),
      output: (current?.output ?? 0) + usage.outputTokens,
    }
    return {
      models: { ...state.models, [model]: nextModel },
      bySeq: { ...state.bySeq, [String(event.seq)]: { provider, model, time: event.time } },
    }
  },
  view: state => state,
  stateVersion: 1,
}
