/**
 * Status-bar management page (`settings.section` entry): master switch,
 * wrap toggle, per-segment checkboxes with reordering, and the
 * user-maintained model price book — add any number of models, each with
 * its own per-1M-token prices and its own peak/off-peak schedule.
 * Writes the same localStorage store as the bar and the usage dialog.
 */

import { memo, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import {
  SEGMENT_IDS,
  SEGMENT_META,
  getConfig,
  modelConfigFor,
  moveSegment,
  nextPeakWindowId,
  removeModelConfig,
  resetConfig,
  setModelConfig,
  updateConfig,
  useStatusBarConfig,
  type CostPrices,
  type Currency,
  type ModelConfig,
  type PeakWindow,
  type SegmentId,
} from './config.ts'
import { effectivePrices } from './segments.ts'
import { hourInTimezone, inAnyPeakWindow, peakWindowsLabel, TIMEZONE_OPTIONS } from './timezone.ts'
import { NS } from './locales.ts'
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

/** One model's editable card: prices + peak/off-peak schedule. */
function ModelCard({
  model,
  config,
  isCurrent,
  t,
}: {
  model: string
  config: ModelConfig
  isCurrent: boolean
  t: SettingsSectionProps['t']
}) {
  const [expanded, setExpanded] = useState(isCurrent)
  const patch = (p: Partial<ModelConfig>): void => setModelConfig(model, p)
  const patchWindow = (id: string, p: Partial<Pick<PeakWindow, 'start' | 'end'>>): void => {
    patch({ peakWindows: config.peakWindows.map(w => (w.id === id ? { ...w, ...p } : w)) })
  }
  const addWindow = (): void => {
    patch({ peakWindows: [...config.peakWindows, { id: nextPeakWindowId(), start: '09:00', end: '12:00' }] })
  }
  const removeWindow = (id: string): void => {
    if (config.peakWindows.length <= 1) return
    patch({ peakWindows: config.peakWindows.filter(w => w.id !== id) })
  }

  const hour = hourInTimezone(config.timezone)
  const inPeak = config.peakOffpeak && inAnyPeakWindow(hour, config.peakWindows)

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
          {inPeak !== false && inPeak === true && (
            <span className="dsb-usage-peak on">{t('section.peak')} {peakWindowsLabel(config.peakWindows)}</span>
          )}
          {config.peakOffpeak && inPeak === false && (
            <span className="dsb-usage-peak">{t('section.offpeak')}</span>
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

          <label className="dsb-set-check">
            <input
              type="checkbox"
              checked={config.peakOffpeak}
              onChange={() => patch({ peakOffpeak: !config.peakOffpeak })}
            />
            <span>{t('section.peakOffpeak')}</span>
          </label>
          <p className="dsb-set-hint">{t('section.peakOffpeakHint')}</p>

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
                <label className="dsb-set-price">
                  <span>{t('section.peakWindowStart')}</span>
                  <input
                    type="time"
                    value={window.start}
                    onChange={e => patchWindow(window.id, { start: e.target.value })}
                  />
                </label>
                <label className="dsb-set-price">
                  <span>{t('section.peakWindowEnd')}</span>
                  <input
                    type="time"
                    value={window.end}
                    onChange={e => patchWindow(window.id, { end: e.target.value })}
                  />
                </label>
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

export const SettingsSection = memo(function SettingsSection(props: SettingsSectionProps) {
  const config = useStatusBarConfig()
  const { useSessions, t } = props
  const [newModel, setNewModel] = useState('')

  const updateCost = (patch: Partial<CostPrices>): void => {
    updateConfig({ cost: { ...config.cost, ...patch } })
  }

  const modelNames = Object.keys(config.cost.models)
  const currentModel = useSessions(state =>
    state.current !== undefined
      ? state.byId[state.current]?.projectionValues?.sessionModel?.model ?? undefined
      : undefined)
  const currentPricing = effectivePrices(
    currentModel !== undefined ? { provider: 'unknown', model: currentModel } : null,
    config.cost,
    Date.now(),
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
            placeholder="deepseek-v4-flash"
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
