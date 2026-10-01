/**
 * Live "which tier applies right now, and why" badge, shared by the usage
 * dialog and the settings price book. Renders nothing when the model bills a
 * flat rate. The reason words are what makes the peak/off-peak math auditable:
 * a user sees 谷时（法定节假日）or 谷时（调休上班）instead of an unexplained number.
 */

import { memo } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ModelConfig, StatusBarKey } from './config.ts'
import {
  clockInTimezone,
  nextTierChange,
  peakWindowsLabel,
  type BillingReason,
  type BillingState,
  type HolidayIndex,
} from './timezone.ts'
import { NS } from './locales.ts'

export type StatusPillProps = {
  config: ModelConfig
  state: BillingState
  index: HolidayIndex
  now: number
  t: PropsLocale<typeof NS>['t']
  /** Hide the clock/window detail (compact contexts). */
  compact?: boolean
}

const REASON_KEYS: Record<BillingReason, StatusBarKey> = {
  peak: 'reason.peak',
  night: 'reason.night',
  weekend: 'reason.weekend',
  holiday: 'reason.holiday',
  customOff: 'reason.customOff',
  customWork: 'reason.customWork',
}

export const StatusPill = memo(function StatusPill({
  config,
  state,
  index,
  now,
  t,
  compact = false,
}: StatusPillProps) {
  if (state.tier === 'flat') return null
  const peak = state.tier === 'peak'
  const change = compact ? null : nextTierChange(config, index, now)
  const changeText = change === null
    ? null
    : t(change.tier === 'peak' ? 'section.peakNext' : 'section.offpeakNext', {
      time: clockInTimezone(config.timezone, change.at),
    })
  const schedule = compact || config.peakWindows.length === 0
    ? null
    : `${peakWindowsLabel(config.peakWindows)} · ${config.timezone === 'local' ? t('section.zoneLocal') : config.timezone}`
  return (
    <span className={peak ? 'dsb-usage-peak on' : 'dsb-usage-peak'}>
      {peak ? t('section.peak') : t('section.offpeak')}
      {state.reason !== null && `（${t(REASON_KEYS[state.reason])}）`}
      {schedule !== null && <span className="dsb-usage-peak-zone">{` ${schedule}`}</span>}
      {changeText !== null && <span className="dsb-usage-peak-zone">{` · ${changeText}`}</span>}
    </span>
  )
})
