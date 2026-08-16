/**
 * Segment computation: pure functions folding session/projection data into
 * display views. Each segment returns null when its data is absent, so the
 * bar only ever shows live facts (and the manager UI can preview segments
 * that are currently hidden for lack of data).
 */

import type {
  ConversationSnapshot,
  JobView,
  SessionSummary,
} from '@deepseek-ai/dsh-client-runtime/client'
import type { SessionStatsProjection } from '@deepseek-ai/dsh-session-stats/client'
import type {
  ContextPressureProjection,
  TokenUsageProjection,
} from '@deepseek-ai/dsh-token-meter/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { modelConfigFor, type CostPrices, type StatusBarConfig, type SegmentId } from './config.ts'
import { formatCost, formatDuration, formatTokens, formatTokensPerSecond } from './format.ts'
import type { NS } from './locales.ts'
import { hourInTimezone, inAnyPeakWindow } from './timezone.ts'
import { costBreakdown, stepCost, stepModel, type SessionUsageClientState } from './session-usage-cost.ts'

export type StatusState = 'running' | 'idle' | 'error'

export interface SegmentView {
  id: SegmentId
  /** Status segment only: drives the leading state dot. */
  state?: StatusState
  text: string
}

/** Last model identity (projection first, node provenance as fallback). */
export interface ModelIdentity {
  provider: string
  model: string
}

export interface SegmentSource {
  session: ConversationSnapshot
  /** Whole-log projection, or the window fold when the unit is absent. */
  stats: SessionStatsProjection | null
  usage: TokenUsageProjection | undefined
  pressure: ContextPressureProjection | undefined
  /** Live generation rate from this plugin's host-side liveTokenUsage fold (stream estimate, carried while idle). */
  liveRate: number | undefined
  /** Last model identity from the host-side sessionModel projection. */
  sessionModel: ModelIdentity | undefined
  /** Per-model usage + per-step model map from the host sessionUsage projection. */
  sessionUsage: SessionUsageClientState | undefined
  jobs: readonly JobView[] | undefined
  summary: SessionSummary | undefined
  /** Wall-clock now (ticked by the bar while it renders sessionTime). */
  now: number
}

type T = TranslateNS<typeof NS>

/**
 * Window-scoped fallback fold over the snapshot's settled nodes — mirrors the
 * shipped stats line's fallback so assemblies without the `sessionStats`
 * projection still get counts and wall times.
 */
export function deriveWindowStats(session: ConversationSnapshot): SessionStatsProjection {
  let turns = 0
  let steps = 0
  let llmMs = 0
  let toolMs = 0
  let ttftMs = 0
  let ttftSteps = 0
  let decodeMs = 0
  let decodeTokens = 0
  const seenTurns = new Set<number>()
  for (const node of session.nodes) {
    if (node.kind === 'tool-result') {
      if (node.callTime !== null) toolMs += Math.max(0, node.time - node.callTime)
      continue
    }
    if (node.kind !== 'assistant') continue
    seenTurns.add(node.turn)
    steps += 1
    const timing = node.timing
    if (timing !== undefined && timing.stepStartTime !== null) {
      llmMs += Math.max(0, timing.completedTime - timing.stepStartTime)
    }
    if (timing?.firstTokenTime !== null && timing?.firstTokenTime !== undefined && timing.stepStartTime !== null) {
      ttftMs += Math.max(0, timing.firstTokenTime - timing.stepStartTime)
      ttftSteps += 1
    }
    if (timing !== undefined && node.usage !== undefined) {
      const output = (node.usage as { outputTokens?: number }).outputTokens
      if (timing.completedTime !== null && output !== undefined && output > 0) {
        const start = timing.firstTokenTime ?? timing.stepStartTime
        if (start !== null) {
          decodeMs += Math.max(0, timing.completedTime - start)
          decodeTokens += output
        }
      }
    }
  }
  turns = seenTurns.size
  return { turns, steps, llmMs, toolMs, ttftMs, ttftSteps, decodeMs, decodeTokens }
}

/** Billed prompt-side tokens (the three disjoint buckets). */
export function billedInputTokens(usage: TokenUsageProjection): number {
  return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens
}

/**
 * Last model identity: the host `sessionModel` projection when served,
 * falling back to the window's last assistant node with provenance (the
 * shipped assembly omits provenance, so the projection is the live path).
 */
export function lastModel(
  session: ConversationSnapshot,
  sessionModel: ModelIdentity | undefined,
): ModelIdentity | null {
  if (sessionModel !== undefined && sessionModel.model !== null) return sessionModel
  for (let i = session.nodes.length - 1; i >= 0; i -= 1) {
    const node = session.nodes[i]
    if (node?.kind === 'assistant' && node.provenance !== undefined) return node.provenance
  }
  return null
}

/** Failed/retried steps visible in the window (durable notices + turn errors). */
export function errorCount(session: ConversationSnapshot): number {
  let count = 0
  for (const node of session.nodes) {
    if (node.kind === 'model-retry' || node.kind === 'turn-error' || node.kind === 'turn-max-tokens') count += 1
  }
  return count
}

/** Live background jobs (running/stopping) for the session, if the mirror serves them. */
export function liveJobCount(jobs: readonly JobView[] | undefined): number {
  if (jobs === undefined) return 0
  let count = 0
  for (const job of jobs) {
    if (job.status === 'running' || job.status === 'stopping') count += 1
  }
  return count
}

/** Session wall time: first turn start → last turn end (or now while running). */
export function sessionElapsed(session: ConversationSnapshot, now: number): number | null {
  let start: number | null = null
  let end: number | null = null
  for (const timing of session.turnTimings.values()) {
    if (start === null || timing.startTime < start) start = timing.startTime
    const t = timing.endTime ?? now
    if (end === null || t > end) end = t
  }
  if (start === null || end === null) return null
  return Math.max(0, end - start)
}

/**
 * Fold every enabled segment into display views, in the user's configured
 * order. Segments whose data is absent drop out entirely.
 */
export function buildSegments(source: SegmentSource, config: StatusBarConfig, t: T): SegmentView[] {
  const views: SegmentView[] = []
  for (const id of config.segments) {
    const view = segmentView(id, source, config, t)
    if (view !== null) views.push(view)
  }
  return views
}

/**
 * Effective input/output/cache prices per 1M tokens for the current model,
 * straight from the user-maintained price book (each model has its own
 * prices and peak schedule). Returns null when the model has no entry —
 * the cost segment then hides instead of guessing.
 * When the model's peak/off-peak billing is on, the peak/off-peak input,
 * cache-hit, and output prices replace the flat rates, using the model's
 * timezone at `now` against ANY of its peak windows.
 */
export function effectivePrices(
  model: ModelIdentity | null,
  cost: CostPrices,
  now: number,
): { input: number; output: number; cacheRead: number; cacheWrite: number; source: 'flat' | 'peak' | 'offpeak' } | null {
  const config = modelConfigFor(cost, model?.model)
  if (config === undefined) return null
  let input = config.input
  let output = config.output
  let cacheRead = config.cacheRead
  const cacheWrite = config.cacheWrite
  let source: 'flat' | 'peak' | 'offpeak' = 'flat'
  if (config.peakOffpeak) {
    const hour = hourInTimezone(config.timezone, new Date(now))
    if (inAnyPeakWindow(hour, config.peakWindows)) {
      input = config.peakInput
      output = config.peakOutput
      cacheRead = config.peakCacheRead
      source = 'peak'
    } else {
      input = config.offpeakInput
      output = config.offpeakOutput
      cacheRead = config.offpeakCacheRead
      source = 'offpeak'
    }
  }
  return { input, output, cacheRead, cacheWrite, source }
}

/** Cost of one token-usage record at the given per-1M-token prices. */
export function costOfUsage(
  usage: { uncachedInputTokens: number; cacheReadTokens: number; cacheWriteTokens: number; outputTokens: number },
  prices: { input: number; cacheRead: number; cacheWrite: number; output: number },
): number {
  return (
    usage.uncachedInputTokens * prices.input
    + usage.cacheReadTokens * prices.cacheRead
    + usage.cacheWriteTokens * prices.cacheWrite
    + usage.outputTokens * prices.output
  ) / 1_000_000
}

/** One row of the usage-history table (provider-reported per-step usage). */
export interface UsageHistoryRow {
  seq: number
  time: number
  model: string | null
  input: number
  /** Cache-hit tokens of this step (priced at the model's cacheRead rate). */
  cacheRead: number
  /** Cache-write tokens of this step (priced at the model's cacheWrite rate). */
  cacheWrite: number
  output: number
  cost: number | null
}

/**
 * Recent per-step usage rows from the settled window: the last assistant
 * nodes that carried provider-reported usage, newest first. Each step's cost
 * is priced with the model that ACTUALLY produced that step (from the host
 * `sessionUsage` fold, node provenance as fallback), applying that model's
 * own price-book entry (with peak/off-peak) at the step's wall-clock time.
 */
export function usageHistory(
  session: ConversationSnapshot,
  state: SessionUsageClientState | undefined,
  cost: CostPrices,
  limit = 60,
): UsageHistoryRow[] {
  const rows: UsageHistoryRow[] = []
  for (let i = session.nodes.length - 1; i >= 0 && rows.length < limit; i -= 1) {
    const node = session.nodes[i]
    if (node?.kind !== 'assistant' || node.usage === undefined) continue
    const usage = node.usage as { inputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number; outputTokens?: number } | null | undefined
    if (usage === null || typeof usage !== 'object') continue
    const input = (usage.inputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0)
    const cacheRead = usage.cacheReadTokens ?? 0
    const cacheWrite = usage.cacheWriteTokens ?? 0
    const output = usage.outputTokens ?? 0
    if (input <= 0 && output <= 0) continue
    const model = stepModel(state, node.seq, node.provenance)
    const costRow = stepCost(state, node.seq, node.provenance, {
      inputTokens: usage.inputTokens ?? 0,
      cacheReadTokens: cacheRead,
      cacheWriteTokens: cacheWrite,
      outputTokens: output,
    }, cost)
    rows.push({
      seq: node.seq,
      time: node.time,
      model: model?.model ?? null,
      input,
      cacheRead,
      cacheWrite,
      output,
      cost: costRow,
    })
  }
  return rows
}

function segmentView(
  id: SegmentId,
  source: SegmentSource,
  config: StatusBarConfig,
  t: T,
): SegmentView | null {
  const { session, stats, usage, pressure, liveRate, jobs, summary, now } = source
  switch (id) {
    case 'status': {
      const running = session.running || session.partial !== null || session.runningCalls.length > 0
      const failed = !running && session.lastAgentError !== null
      const state: StatusState = running ? 'running' : failed ? 'error' : 'idle'
      const text = running
        ? t('bar.status.running')
        : failed
          ? t('bar.status.error')
          : t('bar.status.idle')
      return { id, state, text }
    }
    case 'model': {
      const identity = lastModel(session, source.sessionModel)
      return identity === null ? null : { id, text: identity.model }
    }
    case 'title': {
      const title = summary?.displayTitle
      if (!title) return null
      return { id, text: title.length > 24 ? `${title.slice(0, 24)}…` : title }
    }
    case 'workspace': {
      const cwd = summary?.cwd
      if (!cwd) return null
      const base = cwd.replace(/[\\/]+$/, '').split(/[\\/]/).pop()
      return { id, text: base ?? cwd }
    }
    case 'agent': {
      const preset = summary?.agentPreset
      return preset ? { id, text: preset } : null
    }
    case 'counts': {
      if (stats === null || stats.steps <= 0) return null
      return { id, text: t('bar.counts', { turns: stats.turns, steps: stats.steps }) }
    }
    case 'durations': {
      if (stats === null) return null
      const parts: string[] = []
      if (stats.llmMs > 0) parts.push(t('bar.llm', { duration: formatDuration(stats.llmMs) }))
      if (stats.toolMs > 0) parts.push(t('bar.toolCall', { duration: formatDuration(stats.toolMs) }))
      return parts.length === 0 ? null : { id, text: parts.join(' · ') }
    }
    case 'speeds': {
      if (stats === null) return null
      const parts: string[] = []
      if (stats.ttftSteps > 0) {
        parts.push(t('bar.ttftAverage', { duration: formatDuration(stats.ttftMs / stats.ttftSteps) }))
      }
      if (stats.decodeMs > 0) {
        parts.push(t('bar.decodeSpeed', {
          throughput: formatTokensPerSecond(stats.decodeTokens / (stats.decodeMs / 1_000)),
        }))
      }
      return parts.length === 0 ? null : { id, text: parts.join(' · ') }
    }
    case 'cacheHit': {
      if (usage === undefined) return null
      const denominator = billedInputTokens(usage)
      if (denominator <= 0) return null
      // Two decimals, capped at 99.99 — a 100% cache share still shows a
      // believable figure instead of implying no prompt tokens were billed.
      const percent = Math.min(99.99, usage.cacheReadTokens / denominator * 100).toFixed(2)
      return { id, text: t('bar.cacheHit', { percent }) }
    }
    case 'tokens': {
      if (usage === undefined) return null
      const input = billedInputTokens(usage)
      const output = usage.outputTokens
      if (input <= 0 && output <= 0) return null
      return { id, text: t('bar.tokens', { input: formatTokens(input), output: formatTokens(output) }) }
    }
    case 'context': {
      if (pressure === undefined) return null
      const used = pressure.projectedTokens ?? pressure.pressureTokens
      if (used === undefined || pressure.contextWindow === undefined) return null
      const percent = Math.min(100, Math.round(used / pressure.contextWindow * 100))
      return { id, text: t('bar.context', { percent }) }
    }
    case 'tps': {
      const live = liveRate
      const decode = stats !== null && stats.decodeMs > 0
        ? stats.decodeTokens / (stats.decodeMs / 1_000)
        : undefined
      const rate = live ?? decode
      if (rate === undefined) return null
      return { id, text: t('bar.tps', { throughput: formatTokensPerSecond(rate) }) }
    }
    case 'sessionTime': {
      const elapsed = sessionElapsed(session, now)
      return elapsed === null ? null : { id, text: t('bar.sessionTime', { duration: formatDuration(elapsed) }) }
    }
    case 'cost': {
      if (source.sessionUsage !== undefined) {
        const breakdown = costBreakdown(source.sessionUsage, config.cost, now)
        if (breakdown !== null && breakdown.total > 0) {
          return { id, text: t('bar.cost', { cost: formatCost(breakdown.total, config.cost.currency) }) }
        }
        return null
      }
      // 以下为回退路径：客户端独立装配（无 host 投影）时保持原行为
      if (usage === undefined) return null
      const model = lastModel(session, source.sessionModel)
      const prices = effectivePrices(model, config.cost, now)
      if (prices === null) return null
      if (prices.input <= 0 && prices.cacheRead <= 0 && prices.cacheWrite <= 0 && prices.output <= 0) return null
      const total = costOfUsage(usage, prices)
      if (total <= 0) return null
      return { id, text: t('bar.cost', { cost: formatCost(total, config.cost.currency) }) }
    }
    case 'jobs': {
      const count = liveJobCount(jobs)
      return count <= 0 ? null : { id, text: t('bar.jobs', { count }) }
    }
    case 'queue': {
      const count = session.queue.length
      return count <= 0 ? null : { id, text: t('bar.queue', { count }) }
    }
    case 'errors': {
      const count = errorCount(session)
      return count <= 0 ? null : { id, text: t('bar.errors', { count }) }
    }
    /* v8 ignore next -- closed SegmentId union */
    default: return null
  }
}
