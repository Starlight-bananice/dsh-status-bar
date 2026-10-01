/**
 * Status-bar management page (`settings.section` entry): master switch,
 * wrap toggle, per-segment checkboxes with reordering, the user-maintained
 * model price book (each model owns its prices AND its peak schedule), and the
 * shared holiday calendar that drives DeepSeek's working-day rules.
 * Writes the same localStorage store as the bar and the usage dialog.
 */

import { memo, useEffect, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import {
  SEGMENT_IDS,
  SEGMENT_META,
  applyDeepSeekPreset,
  getConfig,
  modelConfigFor,
  moveSegment,
  nextPeakWindowId,
  removeHolidayOverride,
  removeModelConfig,
  resetConfig,
  setHolidayOverride,
  setModelConfig,
  updateCalendar,
  updateConfig,
  useStatusBarConfig,
  type CostPrices,
  type Currency,
  type DayType,
  type HolidayOverride,
  type ModelConfig,
  type PeakHourWindow,
  type SegmentId,
  type StatusBarKey,
} from './config.ts'
import { DAY_TYPES, DEFAULT_PRICING_TIMEZONE, dateInTimezone, normalizeHHMM, upcomingDays, zoneId, TIMEZONE_OPTIONS, type HolidayIndex } from './timezone.ts'
import { effectivePrices } from './segments.ts'
import { holidayStore, useHolidayAutoFetch, useHolidayView } from './holidays.ts'
import { StatusPill } from './StatusPill.tsx'
import { NS } from './locales.ts'
import { useCurrentModel } from './live-model.ts'
import './projections.ts'

export type SettingsSectionProps =
  PropsRuntime<'settings.section'> & PropsLocale<typeof NS>

/** One row: checkbox + label + hint + reorder arrows. */
function SegmentRow({
  id,
  enabled,
  first,
  last,
  t,
}: {
  id: SegmentId
  enabled: boolean
  first: boolean
  last: boolean
  t: SettingsSectionProps['t']
}) {
  const meta = SEGMENT_META[id]
  return (
    <div className="dsb-set-row">
      <label className="dsb-set-check">
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => {
            const segments = enabled
              ? getConfig().segments.filter(s => s !== id)
              : [...getConfig().segments, id]
            updateConfig({ segments })
          }}
        />
        <span>{t(meta.label)}</span>
      </label>
      <span className="dsb-set-hint">{t(meta.hint)}</span>
      <span className="dsb-set-arrows">
        <button
          type="button"
          aria-label="↑"
          disabled={!enabled || first}
          onClick={() => moveSegment(id, -1)}
        >↑</button>
        <button
          type="button"
          aria-label="↓"
          disabled={!enabled || last}
          onClick={() => moveSegment(id, 1)}
        >↓</button>
      </span>
    </div>
  )
}

/** Number field bound to one model-config number key. */
function PriceField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="dsb-set-price">
      <span>{label}</span>
      <input
        type="number"
        min={0}
        step={0.1}
        value={Number.isFinite(value) ? value : 0}
        onChange={e => {
          const parsed = Number.parseFloat(e.target.value)
          onChange(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0)
        }}
      />
    </label>
  )
}

/**
 * Clock field in 24-hour form. The native `input[type=time]` follows the
 * browser locale and renders 12-hour AM/PM for many users, so this keeps a
 * plain text draft, normalizes what it can (`9:00`, `0900`, `9` → `09:00`) and
 * only commits valid values upward.
 */
function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)
  useEffect(() => { setDraft(value) }, [value])
  const commit = (raw: string): void => {
    const normalized = normalizeHHMM(raw)
    if (normalized === null) {
      setDraft(value)
      return
    }
    setDraft(normalized)
    if (normalized !== value) onChange(normalized)
  }
  return (
    <label className="dsb-set-price">
      <span>{label}</span>
      <input
        type="text"
        className="dsb-time-input"
        inputMode="numeric"
        placeholder="09:00"
        maxLength={5}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit((e.target as HTMLInputElement).value) }}
      />
    </label>
  )
}

/** Day-type checkboxes for one peak window. */
function DayTypePicker({
  days,
  t,
  onToggle,
}: {
  days: readonly DayType[]
  t: SettingsSectionProps['t']
  onToggle: (day: DayType) => void
}) {
  return (
    <div className="dsb-set-daytypes">
      {DAY_TYPES.map(day => (
        <label key={day} className="dsb-set-check dsb-set-daytype">
          <input
            type="checkbox"
            checked={days.includes(day)}
            onChange={() => onToggle(day)}
          />
          <span>{t(day === 'workday' ? 'cal.workday' : day === 'weekend' ? 'cal.weekend' : 'cal.holiday')}</span>
        </label>
      ))}
    </div>
  )
}

/** One model's editable card: prices + peak schedule + live rule state. */
function ModelCard({
  model,
  config,
  isCurrent,
  index,
  dayRules,
  now,
  t,
}: {
  model: string
  config: ModelConfig
  isCurrent: boolean
  index: HolidayIndex
  dayRules: boolean
  now: number
  t: SettingsSectionProps['t']
}) {
  const [expanded, setExpanded] = useState(isCurrent)
  const patch = (p: Partial<ModelConfig>): void => setModelConfig(model, p)
  const patchWindow = (id: string, p: Partial<Pick<PeakHourWindow, 'start' | 'end'>>): void => {
    patch({ peakWindows: config.peakWindows.map(w => (w.id === id ? { ...w, ...p } : w)) })
  }
  const toggleWindowDay = (id: string, day: DayType): void => {
    patch({
      peakWindows: config.peakWindows.map(window => {
        if (window.id !== id) return window
        const days = window.days.includes(day)
          ? window.days.filter(value => value !== day)
          : [...window.days, day]
        return { ...window, days }
      }),
    })
  }
  const addWindow = (): void => {
    patch({ peakWindows: [...config.peakWindows, { id: nextPeakWindowId(), start: '09:00', end: '12:00', days: ['workday'] }] })
  }
  const removeWindow = (id: string): void => {
    if (config.peakWindows.length <= 1) return
    patch({ peakWindows: config.peakWindows.filter(w => w.id !== id) })
  }

  const prices = effectivePrices(
    { provider: 'unknown', model },
    getConfig().cost,
    now,
    dayRules,
    [],
    [],
    index,
  )
  const state = prices?.day !== undefined
    ? { tier: prices.source, reason: prices.reason, day: prices.day }
    : null

  return (
    <div className={isCurrent ? 'dsb-model-card current' : 'dsb-model-card'}>
      <div className="dsb-model-head">
        <button
          type="button"
          className="dsb-model-toggle"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <span className="dsb-model-name">{model}</span>
          {isCurrent && <span className="dsb-model-current">{t('modelBook.current')}</span>}
          {state !== null && (
            <StatusPill config={config} state={state} index={index} now={now} t={t} compact />
          )}
        </button>
        <button
          type="button"
          className="dsb-model-del"
          aria-label={t('modelBook.remove', { model })}
          title={t('modelBook.remove', { model })}
          onClick={() => removeModelConfig(model)}
        >×</button>
      </div>
      {expanded && (
        <div className="dsb-model-body">
          <div className="dsb-set-cost">
            <PriceField label={t('section.priceInput')} value={config.input} onChange={v => patch({ input: v })} />
            <PriceField label={t('section.priceCacheRead')} value={config.cacheRead} onChange={v => patch({ cacheRead: v })} />
            <PriceField label={t('section.priceCacheWrite')} value={config.cacheWrite} onChange={v => patch({ cacheWrite: v })} />
            <PriceField label={t('section.priceOutput')} value={config.output} onChange={v => patch({ output: v })} />
          </div>
          <p className="dsb-set-hint">{t('modelBook.cacheWriteHint')}</p>

          <div className="dsb-set-fetch">
            <label className="dsb-set-check">
              <input
                type="checkbox"
                checked={config.peakOffpeak}
                onChange={() => patch({ peakOffpeak: !config.peakOffpeak })}
              />
              <span>{t('section.peakOffpeak')}</span>
            </label>
            <button type="button" className="dsb-set-reset" onClick={() => applyDeepSeekPreset(model)}>
              {t('section.presetDeepseek')}
            </button>
          </div>
          <p className="dsb-set-hint">{t('section.peakOffpeakHint')}</p>

          <label className="dsb-set-check">
            <input
              type="checkbox"
              checked={config.weekendOffpeak}
              onChange={() => patch({ weekendOffpeak: !config.weekendOffpeak })}
            />
            <span>{t('section.weekendOffpeak')}</span>
          </label>
          <label className="dsb-set-check">
            <input
              type="checkbox"
              checked={config.holidayOffpeak}
              onChange={() => patch({ holidayOffpeak: !config.holidayOffpeak })}
            />
            <span>{t('section.holidayOffpeak')}</span>
          </label>
          <p className="dsb-set-hint">{modelScopeHint(config, dayRules, t)}</p>

          <div className="dsb-set-cost">
            <label className="dsb-set-price">
              <span>{t('section.timezone')}</span>
              <select
                value={config.timezone}
                onChange={e => patch({ timezone: e.target.value })}
              >
                {TIMEZONE_OPTIONS.map(tz => (
                  <option key={tz} value={tz}>
                    {tz === 'local' ? `${t('section.zoneLocal')} (local)` : tz}
                  </option>
                ))}
              </select>
            </label>
            <div className="dsb-set-window-actions">
              <button type="button" className="dsb-set-reset" onClick={addWindow}>
                + {t('section.addWindow')}
              </button>
            </div>
          </div>
          <div className="dsb-set-windows">
            {config.peakWindows.map(window => (
              <div key={window.id} className="dsb-set-window">
                <TimeField
                  label={t('section.peakWindowStart')}
                  value={window.start}
                  onChange={value => patchWindow(window.id, { start: value })}
                />
                <TimeField
                  label={t('section.peakWindowEnd')}
                  value={window.end}
                  onChange={value => patchWindow(window.id, { end: value })}
                />
                <DayTypePicker
                  days={window.days}
                  t={t}
                  onToggle={day => toggleWindowDay(window.id, day)}
                />
                <button
                  type="button"
                  className="dsb-set-window-del"
                  aria-label={t('section.removeWindow')}
                  title={t('section.removeWindow')}
                  disabled={config.peakWindows.length <= 1}
                  onClick={() => removeWindow(window.id)}
                >×</button>
              </div>
            ))}
          </div>
          <div className="dsb-set-cost">
            <PriceField label={`${t('section.peakPrices')} · ${t('section.priceInput')}`} value={config.peakInput} onChange={v => patch({ peakInput: v })} />
            <PriceField label={`${t('section.peakPrices')} · ${t('section.priceCacheRead')}`} value={config.peakCacheRead} onChange={v => patch({ peakCacheRead: v })} />
            <PriceField label={`${t('section.peakPrices')} · ${t('section.priceOutput')}`} value={config.peakOutput} onChange={v => patch({ peakOutput: v })} />
            <PriceField label={`${t('section.offpeakPrices')} · ${t('section.priceInput')}`} value={config.offpeakInput} onChange={v => patch({ offpeakInput: v })} />
            <PriceField label={`${t('section.offpeakPrices')} · ${t('section.priceCacheRead')}`} value={config.offpeakCacheRead} onChange={v => patch({ offpeakCacheRead: v })} />
            <PriceField label={`${t('section.offpeakPrices')} · ${t('section.priceOutput')}`} value={config.offpeakOutput} onChange={v => patch({ offpeakOutput: v })} />
          </div>
        </div>
      )}
    </div>
  )
}

/** Is the plugin's own day rule active right now for this model? */
function modelScopeHint(
  config: ModelConfig,
  dayRules: boolean,
  t: SettingsSectionProps['t'],
): string {
  const parts: string[] = [config.peakOffpeak ? t('section.peakOffpeak') : t('usage.flat')]
  if (config.peakOffpeak && dayRules) {
    if (config.weekendOffpeak) parts.push(t('cal.weekend'))
    if (config.holidayOffpeak) parts.push(t('cal.holiday'))
  }
  return parts.join(' · ')
}

/** Shared holiday-calendar panel: status, refresh, next-7-days, overrides. */
function CalendarPanel({ t }: { t: SettingsSectionProps['t'] }) {
  const config = useStatusBarConfig()
  const { calendars, status, index } = useHolidayView(config.calendar.overrides)
  const [draftDate, setDraftDate] = useState('')
  const [draftKind, setDraftKind] = useState<HolidayOverride['kind']>('off')
  const [draftLabel, setDraftLabel] = useState('')

  useHolidayAutoFetch(config.calendar.autoFetch && config.calendar.dayRules)

  // "Today" is the Beijing-calendar day the rules are written against, not
  // the browser's arbitrary local midnight.
  const today = dateInTimezone(zoneId(DEFAULT_PRICING_TIMEZONE)).date
  const days = upcomingDays(today, 7, index)
  const years = calendars.map(calendar => calendar.year).join(', ')
  const updated = status.fetchedAt === null
    ? t('cal.never')
    : new Date(status.fetchedAt).toLocaleString(undefined, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })

  const addOverride = (): void => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draftDate)) return
    setHolidayOverride(draftDate, draftKind, draftLabel)
    setDraftDate('')
    setDraftLabel('')
  }

  const kindLabel = (override: HolidayOverride): string =>
    override.kind === 'work' ? t('cal.kindWork') : t('cal.kindOff')

  return (
    <div className="dsb-cal">
      <div className="dsb-cal-head">
        <span className="dsb-cal-status">
          {status.loading
            ? t('cal.loading')
            : config.calendar.autoFetch
              ? t('cal.loaded', { years: years === '' ? t('cal.never') : years, time: updated })
              : t('cal.disabled')}
        </span>
        <button
          type="button"
          className="dsb-set-reset"
          disabled={status.loading}
          onClick={() => { void holidayStore.load(true) }}
        >{status.loading ? t('cal.loading') : t('cal.refresh')}</button>
      </div>
      <label className="dsb-set-check">
        <input
          type="checkbox"
          checked={config.calendar.dayRules}
          onChange={() => updateCalendar({ dayRules: !config.calendar.dayRules })}
        />
        <span>{t('section.dayRules')}</span>
      </label>
      <p className="dsb-set-hint">{t('section.dayRulesHint')}</p>
      <label className="dsb-set-check">
        <input
          type="checkbox"
          checked={config.calendar.autoFetch}
          onChange={() => updateCalendar({ autoFetch: !config.calendar.autoFetch })}
        />
        <span>{t('section.autoFetch')}</span>
      </label>
      {!config.calendar.dayRules && <p className="dsb-set-hint">{t('section.dayRulesOff')}</p>}
      {status.error !== null && <p className="dsb-set-msg">{t('cal.error', { error: status.error })}</p>}
      <p className="dsb-set-hint">{t('section.calendarHint')}</p>

      {days.length > 0 && (
        <div className="dsb-cal-strip">
          {days.map(({ facts }) => (
            <span key={facts.date} className="dsb-cal-chip" title={facts.name ?? ''}>
              <span className="dsb-cal-chip-date">{facts.date.slice(5)}</span>
              <span className="dsb-cal-chip-week">{t(WEEKDAY_KEYS[facts.weekday] ?? 'cal.wd0')}</span>
              <span className={facts.isWorkday ? 'dsb-cal-chip-kind work' : 'dsb-cal-chip-kind off'}>
                {facts.isWorkday
                  ? t('cal.workday')
                  : t(facts.kind === 'holiday' ? 'cal.holiday' : 'cal.weekend')}
              </span>
              {facts.name !== undefined && <span className="dsb-cal-chip-name">{facts.name}</span>}
            </span>
          ))}
        </div>
      )}

      <div className="dsb-set-cost">
        <label className="dsb-set-price">
          <span>{t('cal.overrideDate')}</span>
          <input
            type="date"
            value={draftDate}
            onChange={e => setDraftDate(e.target.value)}
          />
        </label>
        <label className="dsb-set-price">
          <span>{t('cal.overrideKind')}</span>
          <select
            value={draftKind}
            onChange={e => setDraftKind(e.target.value as HolidayOverride['kind'])}
          >
            <option value="off">{t('cal.kindOff')}</option>
            <option value="work">{t('cal.kindWork')}</option>
            <option value="auto">{t('cal.kindAuto')}</option>
          </select>
        </label>
        <label className="dsb-set-price">
          <span>{t('cal.overrideNote')}</span>
          <input
            type="text"
            value={draftLabel}
            placeholder={t('cal.overrideNotePlaceholder')}
            onChange={e => setDraftLabel(e.target.value)}
          />
        </label>
        <div className="dsb-set-window-actions">
          <button
            type="button"
            className="dsb-set-reset"
            disabled={!/^\d{4}-\d{2}-\d{2}$/.test(draftDate)}
            onClick={addOverride}
          >+ {t('cal.overrideAdd')}</button>
        </div>
      </div>

      {config.calendar.overrides.length === 0
        ? <p className="dsb-usage-empty">{t('cal.overrideEmpty')}</p>
        : (
          <div className="dsb-set-list">
            {config.calendar.overrides.map(override => (
              <div key={override.date} className="dsb-set-row">
                <span className="dsb-cal-override-date">{override.date}</span>
                <span className="dsb-set-hint">
                  {kindLabel(override)}
                  {override.label !== '' && ` · ${override.label}`}
                </span>
                <button
                  type="button"
                  className="dsb-set-window-del"
                  aria-label={t('cal.overrideRemove', { date: override.date })}
                  title={t('cal.overrideRemove', { date: override.date })}
                  onClick={() => removeHolidayOverride(override.date)}
                >×</button>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}

const WEEKDAY_KEYS: Record<number, StatusBarKey> = {
  0: 'cal.wd0', 1: 'cal.wd1', 2: 'cal.wd2', 3: 'cal.wd3',
  4: 'cal.wd4', 5: 'cal.wd5', 6: 'cal.wd6',
}

export const SettingsSection = memo(function SettingsSection(props: SettingsSectionProps) {
  const config = useStatusBarConfig()
  const { t } = props
  const [newModel, setNewModel] = useState('')
  const [now, setNow] = useState(() => Date.now())

  // The bar ticks its own clock; the settings page keeps a slow one so the
  // live peak/off-peak badge stays honest while it is open.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const updateCost = (patch: Partial<CostPrices>): void => {
    updateConfig({ cost: { ...config.cost, ...patch } })
  }

  const modelNames = Object.keys(config.cost.models)
  // Published by the session-scoped bar: 0.2.0 has no global "current session"
  // in the list state, so the price book previews the model the bar last saw.
  const currentModel = useCurrentModel()
  const { index } = useHolidayView(config.calendar.overrides)
  useHolidayAutoFetch(config.calendar.autoFetch)
  const currentPricing = effectivePrices(
    currentModel !== undefined ? { provider: 'unknown', model: currentModel } : null,
    config.cost,
    now,
  )

  const addModel = (): void => {
    const name = newModel.trim()
    if (name.length === 0) return
    if (modelConfigFor(config.cost, name) === undefined) {
      setModelConfig(name, {})
    }
    setNewModel('')
  }

  return (
    <div className="dsb-set-page">
      <p className="dsb-set-intro">{t('section.intro')}</p>

      <label className="dsb-set-check">
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={() => updateConfig({ enabled: !config.enabled })}
        />
        <span>{t('section.enabled')}</span>
      </label>
      <p className="dsb-set-hint">{t('section.enabledHint')}</p>

      <label className="dsb-set-check">
        <input
          type="checkbox"
          checked={config.wrap}
          onChange={() => updateConfig({ wrap: !config.wrap })}
        />
        <span>{t('section.wrap')}</span>
      </label>
      <p className="dsb-set-hint">{t('section.wrapHint')}</p>

      <h3 className="dsb-set-heading">{t('section.segments')}</h3>
      <p className="dsb-set-hint">{t('section.segmentsHint')}</p>
      <div className="dsb-set-list">
        {SEGMENT_IDS.map(id => (
          <SegmentRow
            key={id}
            id={id}
            enabled={config.segments.includes(id)}
            first={config.segments[0] === id}
            last={config.segments[config.segments.length - 1] === id}
            t={t}
          />
        ))}
      </div>

      <h3 className="dsb-set-heading">{t('section.calendarTitle')}</h3>
      <CalendarPanel t={t} />

      <h3 className="dsb-set-heading">{t('modelBook.title')}</h3>
      <p className="dsb-set-hint">{t('modelBook.hint')}</p>
      {currentModel !== undefined && (
        <p className="dsb-set-hint">
          {t('modelBook.currentModel', { model: currentModel })}
          {currentPricing === null ? ` · ${t('modelBook.unconfigured')}` : ''}
        </p>
      )}
      <label className="dsb-set-price dsb-model-add">
        <span>{t('modelBook.addLabel')}</span>
        <div className="dsb-model-add-row">
          <input
            type="text"
            placeholder="deepseek-flash"
            value={newModel}
            onChange={e => setNewModel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addModel() }}
          />
          <button type="button" className="dsb-set-reset" onClick={addModel} disabled={newModel.trim().length === 0}>
            + {t('modelBook.add')}
          </button>
        </div>
      </label>

      <label className="dsb-set-price dsb-model-currency">
        <span>{t('section.currency')}</span>
        <select
          value={config.cost.currency}
          onChange={e => updateCost({ currency: e.target.value as Currency })}
        >
          <option value="CNY">CNY (¥)</option>
          <option value="USD">USD ($)</option>
        </select>
      </label>

      <div className="dsb-model-list">
        {modelNames.length === 0 && (
          <p className="dsb-usage-empty">{t('modelBook.empty')}</p>
        )}
        {modelNames.map(name => (
          <ModelCard
            key={name}
            model={name}
            config={config.cost.models[name] as ModelConfig}
            isCurrent={name === currentModel}
            index={index}
            dayRules={config.calendar.dayRules}
            now={now}
            t={t}
          />
        ))}
      </div>

      <h3 className="dsb-set-heading">{t('section.preview')}</h3>
      <div className="dsb-bar dsb-wrap dsb-set-preview">
        <span className="dsb-seg"><span className="dsb-dot" style={{ backgroundColor: '#e8b339' }} aria-hidden />{t('bar.status.running')}</span>
        <span className="dsb-sep" aria-hidden>|</span>
        <span className="dsb-seg">{t('preview.line')}</span>
      </div>

      <button type="button" className="dsb-set-reset" onClick={resetConfig}>
        {t('section.reset')}
      </button>
    </div>
  )
})
