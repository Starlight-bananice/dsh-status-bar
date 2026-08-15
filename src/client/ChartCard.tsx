/**
 * Per-model cost chart card: stacked bar chart of token costs inside the
 * usage dialog. Period switch (day = 24 hours, week = 7 days, month = days
 * of the month) plus previous/next period navigation; data comes from the
 * host usage ledger (`/status-bar/api/usage`) and is priced with the
 * user-maintained model price book (flat rates — peak/off-peak only applies
 * to the live moment, not to historical buckets).
 */

import { memo, useEffect, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { modelConfigFor, type CostPrices } from './config.ts'
import { formatCost } from './format.ts'
import { NS } from './locales.ts'

export type ChartPeriod = 'day' | 'week' | 'month'

const PERIODS: readonly ChartPeriod[] = ['day', 'week', 'month']

/** Distinct hues cycled by a stable model-name hash. */
const MODEL_COLORS = [
  '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
  '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#86bcb6',
  '#d4a6c8', '#8cd17d', '#f1ce63', '#a0cbe8', '#ffbe7d',
]

export function modelColor(model: string): string {
  let hash = 0
  for (let i = 0; i < model.length; i += 1) hash = (hash * 31 + model.charCodeAt(i)) >>> 0
  return MODEL_COLORS[hash % MODEL_COLORS.length] ?? '#4e79a7'
}

interface BucketUsage {
  input: number
  cacheRead: number
  cacheWrite: number
  output: number
}

interface ChartResponse {
  start: number
  end: number
  buckets: { key: string; usage: Record<string, BucketUsage> }[]
}

export interface ChartCardProps {
  cost: CostPrices
  t: PropsLocale<typeof NS>['t']
}

/** Cost of one bucket usage at a model's flat price-book rates (CNY/USD). */
function bucketCost(cost: CostPrices, model: string, usage: BucketUsage): number {
  const cfg = modelConfigFor(cost, model)
  if (cfg === undefined) return 0
  return (
    usage.input * cfg.input
    + usage.cacheRead * cfg.cacheRead
    + usage.cacheWrite * cfg.cacheWrite
    + usage.output * cfg.output
  ) / 1_000_000
}

/**
 * Load one period's usage. Uses a SYNCHRONOUS XHR on purpose: this GUI's
 * browser environment deterministically stalls async fetch/XHR responses,
 * while sync requests always complete — the payload is a few hundred bytes
 * served from an in-memory host ledger on loopback, so the blocking cost is
 * sub-millisecond and a hang is effectively impossible.
 */
function fetchUsageSync(period: ChartPeriod, offset: number): ChartResponse {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', `/status-bar/api/usage?period=${period}&offset=${offset}&_=${Date.now()}`, false)
  xhr.send()
  if (xhr.status !== 200) {
    throw new Error(`HTTP ${xhr.status}`)
  }
  return JSON.parse(xhr.responseText) as ChartResponse
}

/** Local-time start of the CURRENT period (mirrors the host's periodStart). */
function currentPeriodStart(period: ChartPeriod, now = Date.now()): number {
  const d = new Date(now)
  d.setMinutes(0, 0, 0)
  if (period === 'day') {
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  if (period === 'week') {
    const mondayOffset = (d.getDay() + 6) % 7
    d.setDate(d.getDate() - mondayOffset)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Hook: while the chart shows the current period (offset 0) with data, poll
 * the calendar boundary every 30s; when the boundary moved past the loaded
 * data's start, bump a tick that re-runs the data effect (which then loads
 * the new current period).
 */
function useRolloverRefresh(
  period: ChartPeriod,
  offset: number,
  data: ChartResponse | null,
  retryTick: number,
): number {
  const [rolloverTick, setRolloverTick] = useState(0)
  useEffect(() => {
    if (offset !== 0 || data === null) return
    const timer = window.setInterval(() => {
      const currentStart = currentPeriodStart(period)
      if (currentStart > data.start) {
        setRolloverTick(t => t + 1)
      }
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [period, offset, data, retryTick])
  return rolloverTick
}

export const ChartCard = memo(function ChartCard({ cost, t }: ChartCardProps) {
  const [period, setPeriod] = useState<ChartPeriod>('day')
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState<ChartResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryTick, setRetryTick] = useState(0)

  // Period rollover: when showing the CURRENT period (offset 0) and the
  // calendar flips to the next day/week/month, refresh automatically so the
  // chart follows the new period instead of pinning yesterday's.
  const rolloverTick = useRolloverRefresh(period, offset, data, retryTick)

  useEffect(() => {
    let cancelled = false
    setError(null)
    setData(null)
    try {
      const body = fetchUsageSync(period, offset)
      if (!cancelled) setData(body)
    } catch (err) {
      if (!cancelled) setError(String((err as Error | undefined)?.message ?? err))
    }
    return () => { cancelled = true }
  }, [period, offset, retryTick, rolloverTick])

  // Per-bucket model costs + per-model totals.
  const buckets = data?.buckets.map(bucket => {
    const per = new Map<string, number>()
    let total = 0
    for (const [model, usage] of Object.entries(bucket.usage)) {
      const c = bucketCost(cost, model, usage)
      if (c <= 0) continue
      per.set(model, c)
      total += c
    }
    return { key: bucket.key, per, total }
  }) ?? []
  const maxTotal = Math.max(1, ...buckets.map(b => b.total))
  const modelTotals = new Map<string, number>()
  for (const bucket of buckets) {
    for (const [model, c] of bucket.per) {
      modelTotals.set(model, (modelTotals.get(model) ?? 0) + c)
    }
  }
  const models = [...modelTotals.entries()].sort((a, b) => b[1] - a[1])

  const label = data === null
    ? ''
    : period === 'day'
      ? new Date(data.start).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
      : period === 'week'
        ? `${new Date(data.start).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })} – ${new Date(data.end - 1).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}`
        : new Date(data.start).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })

  const labelStep = period === 'day' ? 3 : period === 'week' ? 1 : Math.ceil(buckets.length / 10)

  return (
    <div className="dsb-chart-card">
      <div className="dsb-chart-head">
        <span className="dsb-chart-title">{t('chart.title')}</span>
        <div className="dsb-chart-controls">
          <div className="dsb-chart-periods">
            {PERIODS.map(p => (
              <button
                key={p}
                type="button"
                className={p === period ? 'active' : undefined}
                onClick={() => { setPeriod(p); setOffset(0) }}
              >{t(`chart.${p}`)}</button>
            ))}
          </div>
          <div className="dsb-chart-nav">
            <button
              type="button"
              aria-label={t('chart.prev')}
              title={t('chart.prev')}
              onClick={() => setOffset(offset + 1)}
            >‹</button>
            <span className="dsb-chart-period-label">{label}</span>
            <button
              type="button"
              aria-label={t('chart.next')}
              title={t('chart.next')}
              disabled={offset <= 0}
              onClick={() => setOffset(Math.max(0, offset - 1))}
            >›</button>
          </div>
        </div>
      </div>

      {error !== null && (
        <div className="dsb-chart-error">
          <p className="dsb-usage-empty">{t('chart.fail', { error })}</p>
          <button type="button" className="dsb-set-reset" onClick={() => setRetryTick(t => t + 1)}>
            {t('chart.retry')}
          </button>
        </div>
      )}
      {error === null && data === null && <p className="dsb-usage-empty">{t('chart.loading')}</p>}
      {error === null && data !== null && buckets.every(b => b.total <= 0) && (
        <p className="dsb-usage-empty">{t('chart.empty')}</p>
      )}
      {error === null && data !== null && buckets.some(b => b.total > 0) && (
        <>
          <div className="dsb-chart">
            {buckets.map((bucket, i) => (
              <div key={i} className="dsb-chart-col-wrap">
                <div className="dsb-chart-col" style={{ height: `${Math.max(2, bucket.total / maxTotal * 100)}%` }}>
                  {bucket.total > 0 && [...bucket.per.entries()].map(([model, c]) => (
                    <div
                      key={model}
                      className="dsb-chart-seg"
                      style={{ height: `${c / bucket.total * 100}%`, backgroundColor: modelColor(model) }}
                      title={`${model}: ${formatCost(c, cost.currency)}`}
                    />
                  ))}
                </div>
                <span className="dsb-chart-xlabel">
                  {i % labelStep === 0 ? bucket.key : ''}
                </span>
              </div>
            ))}
          </div>
          {models.length > 0 && (
            <div className="dsb-chart-legend">
              {models.map(([model, total]) => (
                <span key={model} className="dsb-chart-legend-item">
                  <span className="dsb-chart-legend-swatch" style={{ backgroundColor: modelColor(model) }} />
                  {model}
                  <span className="dsb-chart-legend-cost">{formatCost(total, cost.currency)}</span>
                  {modelConfigFor(cost, model) === undefined && (
                    <span className="dsb-chart-unpriced">({t('chart.unpriced')})</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
})
