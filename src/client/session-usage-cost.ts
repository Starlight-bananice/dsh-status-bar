/**
 * Shared whole-session cost pricing on the `sessionUsage` projection.
 *
 * The cost segment, usage dialog total, and history rows all price per step
 * with the model that ACTUALLY produced that step's tokens (from the host
 * `sessionUsage` fold), applying that model's own price-book entry AND its
 * peak/off-peak schedule at the step's wall-clock time — instead of the old
 * whole-session-tokens × last-model-price approximation.
 */

import type { CostPrices } from './config.ts'
import {
  costOfUsage,
  effectivePrices,
  type ModelIdentity,
} from './segments.ts'

/** Shape of the host `sessionUsage` projection's view (declared independently so this module stays host-free). */
export interface SessionUsageClientState {
  models: Record<string, {
    input: number
    cacheRead: number
    cacheWrite: number
    output: number
  }>
  bySeq: Record<string, {
    provider: string
    model: string
    time: number
  }>
}

export interface CostBreakdown {
  perModel: ReadonlyMap<string, number>
  total: number
  pricedModels: string[]
}

/**
 * Split the whole-session usage into a per-model cost breakdown, each model
 * priced with ITS OWN price-book entry (peak/off-peak applied at `now`). A
 * model with no configured entry, or one whose effective prices are all zero,
 * is skipped (its cost is unknowable). Returns null when there is no state or
 * no model could be priced.
 */
export function costBreakdown(
  state: SessionUsageClientState | undefined,
  cost: CostPrices,
  now: number,
): CostBreakdown | null {
  if (state === undefined) return null
  const perModel = new Map<string, number>()
  const pricedModels: string[] = []
  let total = 0
  for (const [model, usage] of Object.entries(state.models)) {
    const identity: ModelIdentity = { provider: 'unknown', model }
    const prices = effectivePrices(identity, cost, now)
    if (prices === null) continue
    if (prices.input <= 0 && prices.cacheRead <= 0 && prices.cacheWrite <= 0 && prices.output <= 0) continue
    const stepCost = costOfUsage({
      uncachedInputTokens: usage.input,
      cacheReadTokens: usage.cacheRead,
      cacheWriteTokens: usage.cacheWrite,
      outputTokens: usage.output,
    }, prices)
    perModel.set(model, stepCost)
    total += stepCost
    pricedModels.push(model)
  }
  if (pricedModels.length === 0) return null
  return { perModel, total, pricedModels }
}

/**
 * Model identity for one step: the host `sessionUsage` fold's `bySeq` entry
 * when present, falling back to the node's own provenance, else null.
 */
export function stepModel(
  state: SessionUsageClientState | undefined,
  seq: number,
  provenance: { provider: string; model: string } | undefined,
): ModelIdentity | null {
  return state?.bySeq[String(seq)] ?? provenance ?? null
}

/**
 * Cost of ONE step's token usage, priced with the model that produced it and
 * that model's price-book entry at the step's own wall-clock time (peak/off-peak
 * applied to `now`, or the fold's recorded time when present). Returns null
 * when the step's model is unknown or unconfigured.
 */
export function stepCost(
  state: SessionUsageClientState | undefined,
  seq: number,
  provenance: { provider: string; model: string } | undefined,
  usage: {
    inputTokens: number
    cacheReadTokens: number
    cacheWriteTokens: number
    outputTokens: number
  },
  cost: CostPrices,
): number | null {
  const model = stepModel(state, seq, provenance)
  if (model === null) return null
  const at = state?.bySeq[String(seq)]?.time ?? Date.now()
  const prices = effectivePrices(model, cost, at)
  if (prices === null) return null
  if (prices.input <= 0 && prices.cacheRead <= 0 && prices.cacheWrite <= 0 && prices.output <= 0) return null
  return costOfUsage({
    uncachedInputTokens: usage.inputTokens,
    cacheReadTokens: usage.cacheReadTokens,
    cacheWriteTokens: usage.cacheWriteTokens,
    outputTokens: usage.outputTokens,
  }, prices)
}
