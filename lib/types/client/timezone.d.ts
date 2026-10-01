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
import { DAY_TYPES, type DayType, type HolidayCalendar, type HolidayDay, type HolidayOverride, type ModelConfig, type PeakHourWindow } from './pricing-types.ts';
/** IANA timezones offered in the settings (plus 'local' = the browser zone). */
export declare const TIMEZONE_OPTIONS: readonly ["local", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Taipei", "Asia/Tokyo", "Asia/Seoul", "Asia/Singapore", "Asia/Kolkata", "Europe/London", "Europe/Paris", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Los_Angeles", "UTC"];
export type TimezoneId = (typeof TIMEZONE_OPTIONS)[number];
/** The zone the published schedule is written in (docs give Beijing time). */
export declare const DEFAULT_PRICING_TIMEZONE = "Asia/Shanghai";
/**
 * DeepSeek's published peak windows: 09:00–12:00 and 14:00–18:00 Beijing time
 * on working days (their docs also list 01:00–04:00 / 06:00–10:00 UTC, which
 * is the same thing).
 */
export declare const DEEPSEEK_PEAK_WINDOWS: readonly PeakHourWindow[];
export { DAY_TYPES };
export type { DayType, HolidayDay, HolidayCalendar, HolidayOverride, ModelConfig, PeakHourWindow };
/** Current billing tier plus why it applies (for the badges and hints). */
export type BillingReason = 'peak' | 'night' | 'weekend' | 'holiday' | 'customOff' | 'customWork';
export interface BillingState {
    tier: 'flat' | 'peak' | 'offpeak';
    reason: BillingReason | null;
    day: DayFacts;
}
/** How one calendar date is classified for billing. */
export interface DayFacts {
    /** `YYYY-MM-DD` in the billing timezone. */
    date: string;
    /** 0 = Sunday … 6 = Saturday, in the billing timezone. */
    weekday: number;
    kind: DayType;
    /** A working day: Mon–Fri that is not a holiday, or a 调休 make-up workday. */
    isWorkday: boolean;
    /** Holiday name when the day carries a calendar entry. */
    name?: string;
    /** True when this date comes from the user's manual override list. */
    custom: boolean;
    /** False when no calendar covered this year (weekday rule only). */
    hasCalendar: boolean;
}
/** Calendar lookup for the billing timezone, merged into `date → day` form. */
export interface HolidayIndex {
    /** `YYYY-MM-DD` → published entry. */
    published: ReadonlyMap<string, HolidayDay>;
    /** `YYYY-MM-DD` → manual override. */
    overrides: ReadonlyMap<string, HolidayOverride>;
}
/** Resolved IANA zone for a model ('' / 'local' → the browser zone). */
export declare function zoneId(timezone: string): string;
/** Minute of day (0-1439) in the given zone ('local' or '' = the browser zone). */
export declare function minuteInTimezone(timezone: string, at?: Date): number;
/** Hour of day (0-23) in the given zone. */
export declare function hourInTimezone(timezone: string, at?: Date): number;
/**
 * Calendar date and weekday at `at` in the given zone. This decides "which day
 * is it" for holiday/weekend rules — never the UTC date, which is already the
 * next day for most of the Beijing evening.
 */
export declare function dateInTimezone(timezone: string, at?: Date): {
    date: string;
    weekday: number;
    year: number;
};
/** Add `days` to a `YYYY-MM-DD` date. */
export declare function shiftDate(date: string, days: number): string;
/** Weekday (0 = Sunday) of a `YYYY-MM-DD` date. */
export declare function weekdayOf(date: string): number;
/** Parse `HH:MM` → minutes since midnight; NaN-safe. */
export declare function parseHHMM(value: string): number;
/**
 * Normalize a user-typed clock time to `HH:MM` (24-hour, zero-padded).
 * Accepts `9:00`, `09:00`, `9：00`, `09:00:00`, `0900`, `9`; null when
 * unparseable, so the caller can keep what the user typed until it is valid.
 */
export declare function normalizeHHMM(value: string): string | null;
/** Format minutes since midnight as `HH:MM` (24-hour). */
export declare function formatHHMM(minute: number): string;
/** Is `minute` inside the [start, end) window? Windows may cross midnight. */
export declare function inPeakWindow(minute: number, start: string, end: string): boolean;
/** Is `minute` inside ANY of the given windows (day-type agnostic)? */
export declare function inAnyPeakWindow(minute: number, windows: readonly PeakHourWindow[]): boolean;
/** Does this window apply to the given day type? */
export declare function windowAppliesTo(window: PeakHourWindow, dayType: DayType): boolean;
/** Human label of the peak windows, e.g. `09:00–12:00, 14:00–18:00`. */
export declare function peakWindowsLabel(windows: readonly PeakHourWindow[]): string;
/** Build the date-keyed lookup from calendars (oldest first) + overrides. */
export declare function holidayIndex(calendars: readonly HolidayCalendar[], overrides: readonly HolidayOverride[]): HolidayIndex;
/** Classify one date for billing (weekend / workday / holiday + calendar facts). */
export declare function classifyDate(date: string, index: HolidayIndex): DayFacts;
/** Resolve the billing tier for one model at one instant. */
export declare function resolveBilling(config: ModelConfig, index: HolidayIndex, at: number, dayRules?: boolean): BillingState;
/** Format a timestamp as the 24-hour clock time (`HH:MM`) in a zone. */
export declare function clockInTimezone(timezone: string, at: number): string;
/**
 * First instant after `from` whose billing tier differs, or null when nothing
 * changes inside {@link NEXT_CHANGE_WINDOW_MS} (the badge then just says which
 * tier is live). Windows sit on minute boundaries, so the scan steps by minute.
 */
export declare const NEXT_CHANGE_WINDOW_MS: number;
export declare function nextTierChange(config: ModelConfig, index: HolidayIndex, from: number, dayRules?: boolean): {
    at: number;
    tier: BillingState['tier'];
} | null;
/** Classify the next `count` dates from `from` (settings preview strip). */
export declare function upcomingDays(from: string, count: number, index: HolidayIndex): {
    facts: DayFacts;
    weekend: boolean;
}[];
//# sourceMappingURL=timezone.d.ts.map