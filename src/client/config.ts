/**
 * Status-bar configuration: segment registry, the user-maintained model
 * price book (each model carries its own prices AND peak/off-peak schedule),
 * and a tiny localStorage-backed store with useSyncExternalStore reactivity
 * so the bar, the usage dialog, and the settings page stay consistent live.
 */

import { useSyncExternalStore } from 'react'
import type { LocaleKeysOf } from '@deepseek-ai/dsh-client-ui-slots'
import type { NS } from './locales.ts'

export const STORAGE_KEY = 'dsh.statusBar.v1'

/** Every segment the bar can render, in stable registry order. */
export const SEGMENT_IDS = [
  'status',
  'model',
  'title',
  'workspace',
  'agent',
  'counts',
  'durations',
  'speeds',
  'cacheHit',
  'tokens',
  'context',
  'tps',
  'sessionTime',
  'cost',
  'jobs',
  'queue',
  'errors',
] as const

export type SegmentId = (typeof SEGMENT_IDS)[number]

/** Dictionary key type of this plugin's locale namespace. */
export type StatusBarKey = LocaleKeysOf<typeof NS>

export interface SegmentMeta {
  /** Display name shown in the manager UI (locale key). */
  label: StatusBarKey
  /** One-line hint shown under the manager row (locale key). */
  hint: StatusBarKey
  /** Whether the segment ships enabled by default. */
  defaultOn: boolean
}

/** Segment display metadata; the manager page renders one row per segment. */
export const SEGMENT_META: Record<SegmentId, SegmentMeta> = {
  status: { label: 'seg.status', hint: 'seg.statusHint', defaultOn: true },
  model: { label: 'seg.model', hint: 'seg.modelHint', defaultOn: true },
  title: { label: 'seg.title', hint: 'seg.titleHint', defaultOn: false },
  workspace: { label: 'seg.workspace', hint: 'seg.workspaceHint', defaultOn: false },
  agent: { label: 'seg.agent', hint: 'seg.agentHint', defaultOn: false },
  counts: { label: 'seg.counts', hint: 'seg.countsHint', defaultOn: true },
  durations: { label: 'seg.durations', hint: 'seg.durationsHint', defaultOn: true },
  speeds: { label: 'seg.speeds', hint: 'seg.speedsHint', defaultOn: true },
  cacheHit: { label: 'seg.cacheHit', hint: 'seg.cacheHitHint', defaultOn: true },
  tokens: { label: 'seg.tokens', hint: 'seg.tokensHint', defaultOn: true },
  context: { label: 'seg.context', hint: 'seg.contextHint', defaultOn: true },
  tps: { label: 'seg.tps', hint: 'seg.tpsHint', defaultOn: true },
  sessionTime: { label: 'seg.sessionTime', hint: 'seg.sessionTimeHint', defaultOn: true },
  cost: { label: 'seg.cost', hint: 'seg.costHint', defaultOn: false },
  jobs: { label: 'seg.jobs', hint: 'seg.jobsHint', defaultOn: true },
  queue: { label: 'seg.queue', hint: 'seg.queueHint', defaultOn: true },
  errors: { label: 'seg.errors', hint: 'seg.errorsHint', defaultOn: true },
}

export type Currency = 'CNY' | 'USD'

/** One peak window (may cross midnight); times are 'HH:MM' in the model's timezone. */
export interface PeakWindow {
  id: string
  start: string
  end: string
}

let peakWindowSeq = 0
/** Fresh id for a peak window row. */
export function nextPeakWindowId(): string {
  peakWindowSeq += 1
  return `pw-${Date.now().toString(36)}-${peakWindowSeq}`
}

/** Default peak windows for a newly added model (DeepSeek's official schedule). */
export const DEFAULT_PEAK_WINDOWS: PeakWindow[] = [
  { id: 'peak-1', start: '09:00', end: '12:00' },
  { id: 'peak-2', start: '14:00', end: '18:00' },
]

/**
 * One model's price book entry: per-1M-token prices in the configured
 * currency, plus its OWN peak/off-peak schedule and rates.
 */
export interface ModelConfig {
  input: number
  cacheRead: number
  cacheWrite: number
  output: number
  peakOffpeak: boolean
  /** IANA timezone (or 'local') this model's peak windows are evaluated in. */
  timezone: string
  peakWindows: PeakWindow[]
  peakInput: number
  peakCacheRead: number
  peakOutput: number
  offpeakInput: number
  offpeakCacheRead: number
  offpeakOutput: number
}

export interface CostPrices {
  currency: Currency
  /** User-maintained price book: model id → its prices & peak schedule. */
  models: Record<string, ModelConfig>
}

export interface StatusBarConfig {
  /** Master switch: false hides the bar entirely. */
  enabled: boolean
  /** Allow the bar to wrap onto multiple lines instead of eliding. */
  wrap: boolean
  /** Ordered list of enabled segments. */
  segments: SegmentId[]
  cost: CostPrices
}

export const DEFAULT_CONFIG: StatusBarConfig = {
  enabled: true,
  wrap: false,
  segments: SEGMENT_IDS.filter(id => SEGMENT_META[id].defaultOn),
  cost: {
    currency: 'CNY',
    models: {},
  },
}

function defaultModelConfig(): ModelConfig {
  return {
    input: 2,
    cacheRead: 0.5,
    cacheWrite: 2,
    output: 8,
    peakOffpeak: false,
    timezone: 'local',
    peakWindows: DEFAULT_PEAK_WINDOWS.map(w => ({ ...w })),
    peakInput: 3,
    peakCacheRead: 0.1,
    peakOutput: 9,
    offpeakInput: 1.5,
    offpeakCacheRead: 0.05,
    offpeakOutput: 4.5,
  }
}

/** Sanitize one model config (fills defaults for missing fields). */
function normalizeModelConfig(raw: Partial<ModelConfig> | undefined): ModelConfig {
  const base = defaultModelConfig()
  if (raw === undefined) return base
  const merged: ModelConfig = { ...base, ...raw }
  if (!Array.isArray(merged.peakWindows) || merged.peakWindows.length === 0) {
    merged.peakWindows = base.peakWindows
  }
  return merged
}

/**
 * Migrate a legacy cost block (automatic fetching, global/session price
 * tables, global peak fields) into the user-maintained model book.
 */
function migrateCost(raw: Partial<StatusBarConfig> | undefined): CostPrices {
  const legacy = raw?.cost as Record<string, unknown> | undefined
  if (legacy === undefined) return { ...DEFAULT_CONFIG.cost }
  const currency = legacy.currency === 'USD' ? 'USD' : 'CNY'
  const models: Record<string, ModelConfig> = {}
  // Legacy per-model records (global table + per-session tables).
  const collect = (table: unknown): void => {
    if (table === null || typeof table !== 'object') return
    for (const [model, record] of Object.entries(table as Record<string, unknown>)) {
      if (record === null || typeof record !== 'object') continue
      const r = record as Record<string, unknown>
      const input = typeof r.input === 'number' ? r.input : undefined
      const output = typeof r.output === 'number' ? r.output : undefined
      if (input === undefined || output === undefined) continue
      const cacheRead = typeof r.cacheRead === 'number' ? r.cacheRead : undefined
      const patch: Partial<ModelConfig> = {
        input,
        cacheRead: cacheRead ?? 0.5,
        output,
        peakOffpeak: legacy.peakOffpeak === true,
        timezone: typeof legacy.timezone === 'string' ? legacy.timezone : 'local',
      }
      if (Array.isArray(legacy.peakWindows)) patch.peakWindows = legacy.peakWindows as PeakWindow[]
      if (typeof legacy.peakInput === 'number') patch.peakInput = legacy.peakInput
      if (typeof legacy.peakCacheRead === 'number') patch.peakCacheRead = legacy.peakCacheRead
      if (typeof legacy.peakOutput === 'number') patch.peakOutput = legacy.peakOutput
      if (typeof legacy.offpeakInput === 'number') patch.offpeakInput = legacy.offpeakInput
      if (typeof legacy.offpeakCacheRead === 'number') patch.offpeakCacheRead = legacy.offpeakCacheRead
      if (typeof legacy.offpeakOutput === 'number') patch.offpeakOutput = legacy.offpeakOutput
      models[model] = normalizeModelConfig(patch)
    }
  }
  collect(legacy.prices)
  collect(legacy.sessionPrices)
  return { currency, models }
}

function load(): StatusBarConfig {
  const raw = readStorage()
  if (raw === null) return DEFAULT_CONFIG
  try {
    const parsed = JSON.parse(raw) as Partial<StatusBarConfig>
    const segments = Array.isArray(parsed.segments)
      ? parsed.segments.filter((id): id is SegmentId =>
        SEGMENT_IDS.includes(id as SegmentId))
      : DEFAULT_CONFIG.segments
    const cost = parsed.cost !== undefined && typeof parsed.cost === 'object'
      && 'models' in parsed.cost
      ? { currency: parsed.cost.currency === 'USD' ? 'USD' as const : 'CNY' as const, models: parsed.cost.models }
      : migrateCost(parsed)
    return {
      enabled: parsed.enabled !== false,
      wrap: parsed.wrap === true,
      segments: segments.length > 0 ? segments : DEFAULT_CONFIG.segments,
      cost,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

let config: StatusBarConfig = load()
const listeners = new Set<() => void>()

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function persist(next: StatusBarConfig): void {
  config = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable (private mode / tests): keep the in-memory copy
  }
  for (const listener of listeners) listener()
}

export function subscribeConfig(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getConfig(): StatusBarConfig {
  return config
}

/** Apply a partial update (immutable replace) and persist. */
export function updateConfig(patch: Partial<StatusBarConfig>): void {
  persist({ ...config, ...patch })
}

/** Toggle one segment's membership in the ordered enabled list. */
export function toggleSegment(id: SegmentId): void {
  const segments = config.segments.includes(id)
    ? config.segments.filter(s => s !== id)
    : [...config.segments, id]
  persist({ ...config, segments })
}

/** Move a segment one position in the enabled order (clamped at the ends). */
export function moveSegment(id: SegmentId, delta: -1 | 1): void {
  const index = config.segments.indexOf(id)
  const target = index + delta
  if (index < 0 || target < 0 || target >= config.segments.length) return
  const segments = [...config.segments]
  const [moved] = segments.splice(index, 1)
  if (moved === undefined) return
  segments.splice(target, 0, moved)
  persist({ ...config, segments })
}

export function resetConfig(): void {
  persist({ ...DEFAULT_CONFIG })
}

/** The price-book entry for one model, or undefined when unconfigured. */
export function modelConfigFor(cost: CostPrices, model: string | undefined): ModelConfig | undefined {
  if (model === undefined) return undefined
  return cost.models[model]
}

/** Add or update one model's price-book entry (merge semantics). */
export function setModelConfig(model: string, patch: Partial<ModelConfig>): void {
  const current = config.cost.models[model]
  persist({
    ...config,
    cost: {
      ...config.cost,
      models: {
        ...config.cost.models,
        [model]: normalizeModelConfig({ ...current, ...patch }),
      },
    },
  })
}

/** Remove one model from the price book. */
export function removeModelConfig(model: string): void {
  const models = { ...config.cost.models }
  delete models[model]
  persist({ ...config, cost: { ...config.cost, models } })
}

/** Reactive read for React components (bar, usage dialog, settings page). */
export function useStatusBarConfig(): StatusBarConfig {
  return useSyncExternalStore(subscribeConfig, getConfig)
}
