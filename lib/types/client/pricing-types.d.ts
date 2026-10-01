/**
 * The peak/off-peak pricing data model, shared by the config store (which
 * persists it) and the billing math (which evaluates it). Types only — no
 * imports — so the two modules never form a runtime cycle.
 */
/** Off-peak billing by day type: `workday` = Mon–Fri minus holidays plus 调休. */
export type DayType = 'workday' | 'weekend' | 'holiday';
export declare const DAY_TYPES: readonly DayType[];
/** One peak window: `HH:MM` (24-hour) bounds plus the day types it covers. */
export interface PeakHourWindow {
    id: string;
    /** `HH:MM`, 24-hour clock, in the model's timezone. */
    start: string;
    /** `HH:MM`, 24-hour clock; `end <= start` wraps past midnight. */
    end: string;
    /**
     * Day types this window applies to. `workday` is Mon–Fri minus holidays and
     * plus 调休 make-up days; `weekend` is Sat/Sun; `holiday` is a calendar day
     * marked off. A day billed off-peak never reaches the window check unless
     * its switch in the model config is off.
     */
    days: DayType[];
}
/** One published calendar day: off-day (放假/调休休息) or make-up workday. */
export interface HolidayDay {
    date: string;
    name: string;
    isOffDay: boolean;
}
/** One year of published exceptions. */
export interface HolidayCalendar {
    year: number;
    /** Government notice URLs this year was transcribed from. */
    papers: string[];
    days: HolidayDay[];
}
/** A manual override wins over the published calendar for that date. */
export type OverrideKind = 'off' | 'work' | 'auto';
export interface HolidayOverride {
    date: string;
    kind: OverrideKind;
    /** Free-form note shown in the settings list (e.g. 公司调休). */
    label: string;
}
/**
 * One model's price book entry: per-1M-token prices in the configured
 * currency, plus its OWN peak/off-peak schedule and rates.
 */
export interface ModelConfig {
    input: number;
    cacheRead: number;
    cacheWrite: number;
    output: number;
    peakOffpeak: boolean;
    /** IANA timezone (or 'local') the peak windows are evaluated in. */
    timezone: string;
    /** Peak windows with the day types each one covers. */
    peakWindows: PeakHourWindow[];
    /** Bill all of Saturday/Sunday at off-peak rates (DeepSeek: yes). */
    weekendOffpeak: boolean;
    /** Bill statutory holidays / 调休 rest days at off-peak rates (DeepSeek: yes). */
    holidayOffpeak: boolean;
    peakInput: number;
    peakCacheRead: number;
    peakOutput: number;
    offpeakInput: number;
    offpeakCacheRead: number;
    offpeakOutput: number;
}
//# sourceMappingURL=pricing-types.d.ts.map