/**
 * Usage & cost dialog: a chart icon button at the right end of the composer
 * tool row (next to the quick-toggle gear) opens a modal with the current
 * conversation's provider-reported token usage, the estimated cost at the
 * current model's price-book entry (flat or peak/off-peak), and a recent
 * per-step usage history table — OpenAI-usage-panel style, but fed entirely
 * by DSH's own accounting.
 */

import { memo, useState } from 'react'
import { IconDataOutline16, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionSummary } from '@deepseek-ai/dsh-client-runtime/client'
import { modelConfigFor, setModelConfig, useStatusBarConfig, type ModelConfig } from './config.ts'
import { effectivePrices, usageHistory, type UsageHistoryRow } from './segments.ts'
import { costBreakdown } from './session-usage-cost.ts'
import { formatCost, formatTokens } from './format.ts'
import { hourInTimezone, inAnyPeakWindow, peakWindowsLabel } from './timezone.ts'
import { NS } from './locales.ts'
import './projections.ts'
import { ChartCard } from './ChartCard.tsx'

export type UsageDialogEntryProps =
  PropsRuntime<'conversation.input.right'> & PropsLocale<typeof NS>

function Row({ label, value, hint }: { label: string; value: string; hint?: string | undefined }) {
  return (
    <div className="dsb-usage-stat">
      <span className="dsb-usage-stat-value">{value}</span>
      <span className="dsb-usage-stat-label">{label}</span>
      {hint !== undefined && <span className="dsb-usage-stat-hint">{hint}</span>}
    </div>
  )
}

const HISTORY_PAGE_SIZE = 20
/** Cap total history entries shown (page size × max pages: 20 × 10). */
const HISTORY_MAX_ROWS = HISTORY_PAGE_SIZE * 10

function HistoryTable({ rows, currency, t }: {
  rows: readonly UsageHistoryRow[]
  currency: 'CNY' | 'USD'
  t: UsageDialogEntryProps['t']
}) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(rows.length / HISTORY_PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = rows.slice(safePage * HISTORY_PAGE_SIZE, (safePage + 1) * HISTORY_PAGE_SIZE)
  if (rows.length === 0) {
    return <p className="dsb-usage-empty">{t('usage.empty')}</p>
  }
  return (
    <div>
      <div className="dsb-usage-table-wrap">
        <table className="dsb-usage-table">
          <thead>
            <tr>
              <th>{t('usage.time')}</th>
              <th>{t('usage.model')}</th>
              <th className="num">{t('usage.input')}</th>
              <th className="num">{t('usage.cacheRead')}</th>
              <th className="num">{t('usage.output')}</th>
              <th className="num">{t('usage.cost')}</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(row => (
              <tr key={row.seq}>
                <td className="time">
                  {new Date(row.time).toLocaleString(undefined, {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="model">{row.model ?? '—'}</td>
                <td className="num">{formatTokens(row.input)}</td>
                <td className="num">
                  {formatTokens(row.cacheRead)}
                  {row.cacheWrite > 0 && ` +${t('usage.cacheWrite')} ${formatTokens(row.cacheWrite)}`}
                </td>
                <td className="num">{formatTokens(row.output)}</td>
                <td className="num">
                  {row.cost === null ? '—' : formatCost(row.cost, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="dsb-usage-pager">
          <span>{t('usage.page', { current: safePage + 1, total: totalPages })}</span>
          <button
            type="button"
            disabled={safePage <= 0}
            onClick={() => setPage(safePage - 1)}
          >{t('usage.prev')}</button>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(safePage + 1)}
          >{t('usage.next')}</button>
        </div>
      )}
    </div>
  )
}

function PeakBadge({ config, now, t }: {
  config: ModelConfig
  now: number
  t: UsageDialogEntryProps['t']
}) {
  const hour = hourInTimezone(config.timezone, new Date(now))
  const inPeak = inAnyPeakWindow(hour, config.peakWindows)
  const zone = config.timezone === 'local' ? t('section.zoneLocal') : config.timezone
  return (
    <span className={inPeak ? 'dsb-usage-peak on' : 'dsb-usage-peak'}>
      {inPeak ? t('section.peak') : t('section.offpeak')}
      {' '}
      {peakWindowsLabel(config.peakWindows)}
      {' · '}
      {zone}
    </span>
  )
}

export const UsageDialogEntry = memo(function UsageDialogEntry(props: UsageDialogEntryProps) {
  const config = useStatusBarConfig()
  const { session, useProjection, useSessions, sessionId, t } = props
  const [open, setOpen] = useState(false)

  const usage = useProjection('tokenUsage')
  const pressure = useProjection('contextPressure')
  const sessionUsage = useProjection('sessionUsage')
  const now = Date.now()
  const breakdown = costBreakdown(sessionUsage, config.cost, now)
  const sessionModelValue = useProjection('sessionModel')
  const sessionModel = sessionModelValue !== undefined && sessionModelValue.model !== null
    ? { provider: sessionModelValue.provider ?? 'unknown', model: sessionModelValue.model }
    : undefined
  const summary: SessionSummary | undefined = useSessions(state => state.byId[sessionId])

  const modelConfig = modelConfigFor(config.cost, sessionModel?.model)
  const prices = effectivePrices(sessionModel ?? null, config.cost, now)
  const rows = usageHistory(session, sessionUsage, config.cost, HISTORY_MAX_ROWS)

  const billedInput = usage === undefined
    ? 0
    : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens
  const totalCost = breakdown !== null
    ? breakdown.total
    : usage !== undefined && prices !== null
      ? (usage.uncachedInputTokens * prices.input
        + usage.cacheReadTokens * prices.cacheRead
        + usage.cacheWriteTokens * prices.cacheWrite
        + usage.outputTokens * prices.output) / 1_000_000
      : null

  const usedTokens = pressure?.projectedTokens ?? pressure?.pressureTokens
  const contextPercent = usedTokens !== undefined && pressure?.contextWindow !== undefined
    ? Math.min(100, Math.round(usedTokens / pressure.contextWindow * 100))
    : null

  return (
    <>
      <button
        type="button"
        className="dsb-quick"
        title={t('usage.title')}
        aria-label={t('usage.title')}
        onClick={() => setOpen(true)}
      >
        <IconDataOutline16 />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('usage.title')}
        description={t('usage.subtitle')}
        closeLabel={t('usage.close')}
        className="dsb-usage-modal"
      >
        <div className="dsb-usage-body">
          {/* Cost hero */}
          <div className="dsb-usage-hero">
            <div className="dsb-usage-hero-label">{t('usage.totalCost')}</div>
            {totalCost === null
              ? (
                <div className="dsb-usage-hero-missing">
                  {sessionModel === undefined
                    ? (
                      <span className="dsb-usage-hero-wait">{t('usage.unknownModel')}</span>
                    )
                    : (
                      <>
                        <span>{t('usage.unconfigured', { model: sessionModel.model })}</span>
                        <button
                          type="button"
                          className="dsb-usage-hero-add"
                          onClick={() => setModelConfig(sessionModel.model, {})}
                        >
                          {t('usage.addDefault')}
                        </button>
                      </>
                    )}
                </div>
              )
              : (
                <>
                  <span className="dsb-usage-cost-num">{formatCost(totalCost, config.cost.currency)}</span>
                  <div className="dsb-usage-hero-sub">
                    {modelConfig !== null && modelConfig !== undefined && modelConfig.peakOffpeak && prices !== null && prices.source !== 'flat' && (
                      <PeakBadge config={modelConfig} now={now} t={t} />
                    )}
                    {sessionModel !== undefined && (
                      <span className="dsb-usage-model-chip">{sessionModel.model}</span>
                    )}
                    {summary !== undefined && (
                      <span className="dsb-usage-model-chip">{summary.displayTitle}</span>
                    )}
                  </div>
                </>
              )}
          </div>

          {/* Per-model cost chart */}
          <ChartCard cost={config.cost} t={t} />

          {/* Usage stats */}
          <div className="dsb-usage-stats">
            <Row label={t('usage.input')} value={usage === undefined ? '—' : formatTokens(billedInput)} hint={t('usage.inputHint')} />
            <Row label={t('usage.cacheRead')} value={usage === undefined ? '—' : formatTokens(usage.cacheReadTokens)} />
            <Row label={t('usage.cacheWrite')} value={usage === undefined ? '—' : formatTokens(usage.cacheWriteTokens)} />
            <Row label={t('usage.output')} value={usage === undefined ? '—' : formatTokens(usage.outputTokens)} />
            <Row
              label={t('usage.cacheHitRate')}
              value={usage === undefined || billedInput <= 0
                ? '—'
                : `${Math.min(99.99, usage.cacheReadTokens / billedInput * 100).toFixed(2)}%`}
            />
            <Row
              label={t('usage.context')}
              value={contextPercent === null ? '—' : `${contextPercent}%`}
              hint={usedTokens !== undefined && pressure?.contextWindow !== undefined
                ? `${formatTokens(usedTokens)} / ${formatTokens(pressure.contextWindow)}`
                : undefined}
            />
          </div>

          {/* Price book card */}
          {modelConfig !== undefined && (
            <div className="dsb-usage-prices">
              <span className="dsb-usage-prices-title">
                {t('usage.prices', { model: sessionModel?.model ?? '?' })}
              </span>
              {prices !== null && (
                <>
                  <span>{t('usage.pIn')} {formatCost(prices.input, config.cost.currency)}</span>
                  <span>{t('usage.pCache')} {formatCost(prices.cacheRead, config.cost.currency)}</span>
                  <span>{t('usage.pOut')} {formatCost(prices.output, config.cost.currency)}</span>
                  <span className="dsb-usage-price-src">
                    {prices.source === 'flat'
                      ? t('usage.flat')
                      : t(prices.source === 'peak' ? 'section.source.peak' : 'section.source.offpeak')}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Usage history */}
          <div className="dsb-usage-history-title">{t('usage.history')}</div>
          <p className="dsb-set-hint">{t('usage.historyHint')}</p>
          <HistoryTable rows={rows} currency={config.cost.currency} t={t} />
        </div>
      </Modal>
    </>
  )
})
