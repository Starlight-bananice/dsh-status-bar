/**
 * Timezone-aware peak/off-peak billing math.
 *
 * DeepSeek bills peak rates only on **working days**: Mon–Fri, excluding
 * Chinese statutory holidays, inside a few clock windows. Weekends, holidays
 * AND 调休 adjusted rest days are off-peak all day, and both the windows and
 * the calendar change without notice — so this module models the rule instead
 * of one snapshot of it:
 *
 *   peak  ⟺  today is a working day
 *            AND now falls in a peak window enabled for today's day type
 *
 * Everything else is off-peak, which is why keeping the holiday calendar
 * current is enough — no re-tuning window lists when the schedule shifts.
 */

import {
  DAY_TYPES,
  type DayType,
  type HolidayCalendar,
  type HolidayDay,
  type HolidayOverride,
  type ModelConfig,
  type PeakHourWindow,
} from './pricing-types.ts'

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

/** The zone the published schedule is written in (docs give Beijing time). */
export const DEFAULT_PRICING_TIMEZONE = 'Asia/Shanghai'

/**
 * DeepSeek's published peak windows: 09:00–12:00 and 14:00–18:00 Beijing time
 * on working days (their docs also list 01:00–04:00 / 06:00–10:00 UTC, which
 * is the same thing).
 */
export const DEEPSEEK_PEAK_WINDOWS: readonly PeakHourWindow[] = [
  { id: 'peak-1', start: '09:00', end: '12:00', days: ['workday'] },
  { id: 'peak-2', start: '14:00', end: '18:00', days: ['workday'] },
]

export { DAY_TYPES }
export type { DayType, HolidayDay, HolidayCalendar, HolidayOverride, ModelConfig, PeakHourWindow }

/** Current billing tier plus why it applies (for the badges and hints). */
export type BillingReason =
  | 'peak'
  | 'night'
  | 'weekend'
  | 'holiday'
  | 'customOff'
  | 'customWork'

export interface BillingState {
  tier: 'flat' | 'peak' | 'offpeak'
  reason: BillingReason | null
  day: DayFacts
}

/** How one calendar date is classified for billing. */
export interface DayFacts {
  /** `YYYY-MM-DD` in the billing timezone. */
  date: string
  /** 0 = Sunday … 6 = Saturday, in the billing timezone. */
  weekday: number
  kind: DayType
  /** A working day: Mon–Fri that is not a holiday, or a 调休 make-up workday. */
  isWorkday: boolean
  /** Holiday name when the day carries a calendar entry. */
  name?: string
  /** True when this date comes from the user's manual override list. */
  custom: boolean
  /** False when no calendar covered this year (weekday rule only). */
  hasCalendar: boolean
}

/** Calendar lookup for the billing timezone, merged into `date → day` form. */
export interface HolidayIndex {
  /** `YYYY-MM-DD` → published entry. */
  published: ReadonlyMap<string, HolidayDay>
  /** `YYYY-MM-DD` → manual override. */
  overrides: ReadonlyMap<string, HolidayOverride>
}

/** Resolved IANA zone for a model ('' / 'local' → the browser zone). */
export function zoneId(timezone: string): string {
  if (timezone !== '' && timezone !== 'local') return timezone
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

// Formatters are cached per zone: the billing resolver runs once per scanned
// minute when a badge looks up the next tier change, so re-instantiating
// Intl.DateTimeFormat there would dominate the cost.
const minuteFormatters = new Map<string, Intl.DateTimeFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function minuteFormatter(timezone: string): Intl.DateTimeFormat {
  let formatter = minuteFormatters.get(timezone)
  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    minuteFormatters.set(timezone, formatter)
  }
  return formatter
}

function dateFormatter(timezone: string): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(timezone)
  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    })
    dateFormatters.set(timezone, formatter)
  }
  return formatter
}

/** Minute of day (0-1439) in the given zone ('local' or '' = the browser zone). */
export function minuteInTimezone(timezone: string, at: Date = new Date()): number {
  if (timezone === 'local' || timezone === '') return at.getHours() * 60 + at.getMinutes()
  try {
    const parts = minuteFormatter(timezone).formatToParts(at)
    const read = (type: string): number => Number(parts.find(part => part.type === type)?.value ?? '0')
    return read('hour') * 60 + read('minute')
  } catch {
    return at.getHours() * 60 + at.getMinutes()
  }
}

/** Hour of day (0-23) in the given zone. */
export function hourInTimezone(timezone: string, at: Date = new Date()): number {
  return Math.floor(minuteInTimezone(timezone, at) / 60)
}

const WEEKDAY_TOKENS: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
}

/**
 * Calendar date and weekday at `at` in the given zone. This decides "which day
 * is it" for holiday/weekend rules — never the UTC date, which is already the
 * next day for most of the Beijing evening.
 */
export function dateInTimezone(timezone: string, at: Date = new Date()): {
  date: string
  weekday: number
  year: number
} {
  const iso = (year: number, month: number, day: number): string =>
    `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  if (timezone === 'local' || timezone === '') {
    return {
      date: iso(at.getFullYear(), at.getMonth() + 1, at.getDate()),
      weekday: at.getDay(),
      year: at.getFullYear(),
    }
  }
  try {
    const parts = dateFormatter(timezone).formatToParts(at)
    const read = (type: string): string => parts.find(part => part.type === type)?.value ?? ''
    const year = Number(read('year'))
    return {
      date: iso(year, Number(read('month')), Number(read('day'))),
      weekday: WEEKDAY_TOKENS[read('weekday')] ?? at.getDay(),
      year,
    }
  } catch {
    return {
      date: iso(at.getFullYear(), at.getMonth() + 1, at.getDate()),
      weekday: at.getDay(),
      year: at.getFullYear(),
    }
  }
}

/** Add `days` to a `YYYY-MM-DD` date. */
export function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  if (year === undefined || month === undefined || day === undefined) return date
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`
}

/** Weekday (0 = Sunday) of a `YYYY-MM-DD` date. */
export function weekdayOf(date: string): number {
  const [year, month, day] = date.split('-').map(Number)
  if (year === undefined || month === undefined || day === undefined) return 0
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

/** Parse `HH:MM` → minutes since midnight; NaN-safe. */
export function parseHHMM(value: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (match === null) return NaN
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return NaN
  return hours * 60 + minutes
}

/**
 * Normalize a user-typed clock time to `HH:MM` (24-hour, zero-padded).
 * Accepts `9:00`, `09:00`, `9：00`, `09:00:00`, `0900`, `9`; null when
 * unparseable, so the caller can keep what the user typed until it is valid.
 */
export function normalizeHHMM(value: string): string | null {
  const trimmed = value.trim().replace(/[：.]/g, ':')
  const colon = /^(\d{1,2}):(\d{1,2})(?::\d{1,2})?$/.exec(trimmed)
  const compact = /^(\d{3,4})$/.exec(trimmed)
  const bare = /^(\d{1,2})$/.exec(trimmed)
  let hours: number
  let minutes: number
  if (colon !== null) {
    hours = Number(colon[1])
    minutes = Number(colon[2])
  } else if (compact !== null) {
    const digits = compact[1] ?? ''
    hours = Number(digits.slice(0, -2))
    minutes = Number(digits.slice(-2))
  } else if (bare !== null) {
    hours = Number(bare[1])
    minutes = 0
  } else {
    return null
  }
  if (hours > 23 || minutes > 59) return null
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Format minutes since midnight as `HH:MM` (24-hour). */
export function formatHHMM(minute: number): string {
  const wrapped = ((Math.round(minute) % 1440) + 1440) % 1440
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`
}

/** Is `minute` inside the [start, end) window? Windows may cross midnight. */
export function inPeakWindow(minute: number, start: string, end: string): boolean {
  const from = parseHHMM(start)
  const to = parseHHMM(end)
  if (Number.isNaN(from) || Number.isNaN(to)) return false
  if (from === to) return true // full-day peak
  if (from < to) return minute >= from && minute < to
  return minute >= from || minute < to // crosses midnight
}

/** Is `minute` inside ANY of the given windows (day-type agnostic)? */
export function inAnyPeakWindow(minute: number, windows: readonly PeakHourWindow[]): boolean {
  for (const window of windows) {
    if (inPeakWindow(minute, window.start, window.end)) return true
  }
  return false
}

/** Does this window apply to the given day type? */
export function windowAppliesTo(window: PeakHourWindow, dayType: DayType): boolean {
  return window.days.length === 0 || window.days.includes(dayType)
}

/** Human label of the peak windows, e.g. `09:00–12:00, 14:00–18:00`. */
export function peakWindowsLabel(windows: readonly PeakHourWindow[]): string {
  return windows.map(window => `${window.start}–${window.end}`).join(', ')
}

/** Build the date-keyed lookup from calendars (oldest first) + overrides. */
export function holidayIndex(
  calendars: readonly HolidayCalendar[],
  overrides: readonly HolidayOverride[],
): HolidayIndex {
  const published = new Map<string, HolidayDay>()
  for (const calendar of calendars) {
    for (const day of calendar.days) published.set(day.date, day)
  }
  const overrideMap = new Map<string, HolidayOverride>()
  for (const override of overrides) overrideMap.set(override.date, override)
  return { published, overrides: overrideMap }
}

/** Classify one date for billing (weekend / workday / holiday + calendar facts). */
export function classifyDate(date: string, index: HolidayIndex): DayFacts {
  const weekday = weekdayOf(date)
  const isWeekend = weekday === 0 || weekday === 6
  const published = index.published.get(date)
  const override = index.overrides.get(date)
  const hasCalendar = published !== undefined || (override !== undefined && override.kind !== 'auto')

  let isWorkday: boolean
  let kind: DayType
  let custom = false
  if (override !== undefined && override.kind !== 'auto') {
    custom = true
    isWorkday = override.kind === 'work'
    kind = isWorkday ? 'workday' : (isWeekend ? 'weekend' : 'holiday')
  } else if (published !== undefined) {
    isWorkday = !published.isOffDay
    kind = isWorkday ? 'workday' : (isWeekend ? 'weekend' : 'holiday')
  } else {
    isWorkday = !isWeekend
    kind = isWeekend ? 'weekend' : 'workday'
  }

  const facts: DayFacts = { date, weekday, kind, isWorkday, custom, hasCalendar }
  const name = override?.label !== undefined && override.label !== ''
    ? override.label
    : published?.name
  if (name !== undefined && name !== '') facts.name = name
  return facts
}

/** Resolve the billing tier for one model at one instant. */
export function resolveBilling(
  config: ModelConfig,
  index: HolidayIndex,
  at: number,
  dayRules = true,
): BillingState {
  const timezone = zoneId(config.timezone)
  const moment = new Date(at)
  const day = classifyDate(dateInTimezone(timezone, moment).date, index)
  if (!config.peakOffpeak) return { tier: 'flat', reason: null, day }

  // Without the day-aware rules the schedule is a plain clock window list:
  // weekends and holidays never short-circuit it.
  const offpeakDay = !dayRules || day.isWorkday
    ? false
    : day.kind === 'holiday' ? config.holidayOffpeak : config.weekendOffpeak
  if (offpeakDay) {
    return {
      tier: 'offpeak',
      reason: day.custom ? 'customOff' : day.kind === 'holiday' ? 'holiday' : 'weekend',
      day,
    }
  }

  const minute = minuteInTimezone(timezone, moment)
  const matched = config.peakWindows.some(window =>
    windowAppliesTo(window, dayRules ? day.kind : 'workday')
    && inPeakWindow(minute, window.start, window.end))
  if (matched) return { tier: 'peak', reason: 'peak', day }
  return { tier: 'offpeak', reason: day.custom ? 'customWork' : 'night', day }
}

/** Format a timestamp as the 24-hour clock time (`HH:MM`) in a zone. */
export function clockInTimezone(timezone: string, at: number): string {
  return formatHHMM(minuteInTimezone(timezone, new Date(at)))
}

/**
 * First instant after `from` whose billing tier differs, or null when nothing
 * changes inside {@link NEXT_CHANGE_WINDOW_MS} (the badge then just says which
 * tier is live). Windows sit on minute boundaries, so the scan steps by minute.
 */
export const NEXT_CHANGE_WINDOW_MS = 26 * 60 * 60 * 1000

export function nextTierChange(
  config: ModelConfig,
  index: HolidayIndex,
  from: number,
  dayRules = true,
): { at: number; tier: BillingState['tier'] } | null {
  if (!config.peakOffpeak) return null
  const current = resolveBilling(config, index, from, dayRules).tier
  const cap = from + NEXT_CHANGE_WINDOW_MS
  for (let at = from + 60_000; at <= cap; at += 60_000) {
    const tier = resolveBilling(config, index, at, dayRules).tier
    if (tier !== current) return { at, tier }
  }
  return null
}

/** Classify the next `count` dates from `from` (settings preview strip). */
export function upcomingDays(
  from: string,
  count: number,
  index: HolidayIndex,
): { facts: DayFacts; weekend: boolean }[] {
  const rows: { facts: DayFacts; weekend: boolean }[] = []
  for (let offset = 0; offset < count; offset += 1) {
    const date = shiftDate(from, offset)
    const weekday = weekdayOf(date)
    rows.push({ facts: classifyDate(date, index), weekend: weekday === 0 || weekday === 6 })
  }
  return rows
}
