/**
 * Host-side Chinese holiday-calendar source for the client's peak/off-peak
 * pricing: DeepSeek bills peak rates only on working days (Mon–Fri minus
 * Chinese public holidays), while weekends, statutory holidays AND 调休
 * (adjusted rest days) are off-peak all day. Those dates are re-announced by
 * the State Council every year, so the client cannot hard-code them.
 *
 * The host fetches the published calendar (holiday-cn, which transcribes the
 * State Council notices), caches it on disk under the plugin's data directory,
 * and serves it to the browser half over the plugin's own HTTP route — the
 * renderer never talks to a third party directly.
 *
 * @module @bananiceee/dsh-status-bar/holiday-source
 */
/** One exception day: `isOffDay` true = 放假/调休休息日, false = 调休上班. */
export interface HolidayDay {
    date: string;
    name: string;
    isOffDay: boolean;
}
/** One year of exceptions, as published. */
export interface HolidayCalendar {
    year: number;
    /** Government notice URLs this year was transcribed from. */
    papers: string[];
    days: HolidayDay[];
}
/** Result for one year: the calendar plus where it came from. */
export interface HolidayYearResult {
    calendar: HolidayCalendar;
    source: 'cache' | 'network';
    fetchedAt: number;
    /** Set when the refresh fell back to a cached copy. */
    warning?: string;
}
/** Public data source (jsDelivr CDN mirror of the holiday-cn dataset). */
export declare const HOLIDAY_CDN_BASE = "https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master";
/** DeepSeek's schedule is defined in Beijing time; the calendar is its calendar. */
export declare const HOLIDAY_TIMEZONE = "Asia/Shanghai";
/** The plugin's local data directory (same root as the usage ledger). */
export declare function holidayCacheFile(dshHome: string | undefined): string;
/**
 * Calendars for the requested years, newest-first refetch on `refresh`.
 * A failed refresh falls back to whatever is cached for that year; a year that
 * has never been fetched and cannot be reached is reported in `errors`.
 */
export declare function loadHolidayCalendars(years: readonly number[], refresh: boolean, dshHome: string | undefined, now?: Date): Promise<{
    years: HolidayYearResult[];
    errors: {
        year: number;
        message: string;
    }[];
    today: string;
}>;
/**
 * Route handler payload: every year whose rules can still apply right now —
 * last year (a fetch happening in early January must know about the previous
 * year's 调休), the current year, and next year.
 */
export declare function holidayApiPayload(requested: number | null, refresh: boolean, dshHome: string | undefined, now?: Date): Promise<{
    today: string;
    requested: number;
    years: HolidayYearResult[];
    errors: {
        year: number;
        message: string;
    }[];
    source: string;
}>;
