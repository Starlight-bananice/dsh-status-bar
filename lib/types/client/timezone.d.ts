/**
 * Timezone-aware peak/off-peak hour math for the cost segment.
 */
import type { PeakWindow } from './config.ts';
/** IANA timezones offered in the settings (plus 'local' = the browser zone). */
export declare const TIMEZONE_OPTIONS: readonly ["local", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Taipei", "Asia/Tokyo", "Asia/Seoul", "Asia/Singapore", "Asia/Kolkata", "Europe/London", "Europe/Paris", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Los_Angeles", "UTC"];
export type TimezoneId = (typeof TIMEZONE_OPTIONS)[number];
/** Hour of day (0-23) at the given IANA timezone (or the local zone). */
export declare function hourInTimezone(timezone: string, at?: Date): number;
/** Is `hour` inside the [start, end) window? Supports windows crossing midnight. */
export declare function inPeakWindow(hour: number, start: string, end: string): boolean;
/** Is `hour` inside ANY of the configured peak windows? */
export declare function inAnyPeakWindow(hour: number, windows: readonly PeakWindow[]): boolean;
/** Human label of the peak windows, e.g. '09:00–12:00, 14:00–18:00'. */
export declare function peakWindowsLabel(windows: readonly PeakWindow[]): string;
//# sourceMappingURL=timezone.d.ts.map