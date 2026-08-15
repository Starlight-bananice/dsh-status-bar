/**
 * Timezone-aware peak/off-peak hour math for the cost segment.
 */

import type { PeakWindow } from './config.ts'

/** IANA timezones offered in the settings (plus 'local' = the browser zone). */
export const TIMEZONE_OPTIONS = [
  'local',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Taipei',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'UTC',
] as const

export type TimezoneId = (typeof TIMEZONE_OPTIONS)[number]

/** Hour of day (0-23) at the given IANA timezone (or the local zone). */
export function hourInTimezone(timezone: string, at: Date = new Date()): number {
  if (timezone === 'local' || timezone === '') return at.getHours()
  try {
    return Number(new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(at))
  } catch {
    return at.getHours()
  }
}

/** Parse 'HH:MM' → minutes since midnight; NaN-safe. */
function parseHHMM(value: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (m === null) return NaN
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return NaN
  return h * 60 + min
}

/** Is `hour` inside the [start, end) window? Supports windows crossing midnight. */
export function inPeakWindow(hour: number, start: string, end: string): boolean {
  const s = parseHHMM(start)
  const e = parseHHMM(end)
  if (Number.isNaN(s) || Number.isNaN(e)) return false
  if (s === e) return true // full-day peak
  const h = hour * 60
  if (s < e) return h >= s && h < e
  return h >= s || h < e // crosses midnight
}

/** Is `hour` inside ANY of the configured peak windows? */
export function inAnyPeakWindow(hour: number, windows: readonly PeakWindow[]): boolean {
  for (const window of windows) {
    if (inPeakWindow(hour, window.start, window.end)) return true
  }
  return false
}

/** Human label of the peak windows, e.g. '09:00–12:00, 14:00–18:00'. */
export function peakWindowsLabel(windows: readonly PeakWindow[]): string {
  return windows.map(w => `${w.start}–${w.end}`).join(', ')
}
