/**
 * Holiday-calendar store for the peak/off-peak pricing.
 *
 * The published Chinese holiday / 调休 calendar changes every year, so the
 * client never hard-codes it: it asks this plugin's own host route
 * (`/status-bar/api/holidays`, which fetches + caches the dataset on disk),
 * keeps the answer in localStorage so the cost segment prices correctly on the
 * first paint, and exposes a `useSyncExternalStore` hook. A failed fetch never
 * throws into render — it degrades to the weekday rule and surfaces a message
 * in the settings page.
 */
import type { HolidayCalendar, HolidayOverride, ModelConfig } from './pricing-types.ts';
import { type BillingState, type HolidayIndex } from './timezone.ts';
export declare const HOLIDAY_CACHE_KEY = "dsh.statusBar.holidays.v1";
export interface StoredCalendars {
    fetchedAt: number;
    years: HolidayCalendar[];
}
export interface HolidayStatus {
    /** True while a host request is in flight. */
    loading: boolean;
    /** Last failure or fallback message, cleared by the next clean fetch. */
    error: string | null;
    /** Provenance of the last successful fetch (dataset URL). */
    source: string | null;
    fetchedAt: number | null;
}
export interface HolidaySnapshot {
    calendars: HolidayCalendar[];
    status: HolidayStatus;
}
declare class HolidayStore {
    private snapshot;
    private inflight;
    private readonly listeners;
    constructor();
    subscribe: (listener: () => void) => (() => void);
    getSnapshot: () => HolidaySnapshot;
    /** Fetch from the plugin host; concurrent callers share one request. */
    load(refresh?: boolean): Promise<void>;
    /** Fetch when the cached copy is stale (never rejects). */
    loadIfStale(): Promise<void>;
    private run;
    private setSnapshot;
    private emit;
}
export declare const holidayStore: HolidayStore;
/** Non-reactive read for pure code paths (segment/cost folds outside render). */
export declare function currentCalendars(): readonly HolidayCalendar[];
/** Reactive calendar state (settings page). */
export declare function useHolidayCalendars(): HolidaySnapshot;
/**
 * One store read for a whole panel: the merged lookup AND the calendars it was
 * built from, both from the same snapshot. Splitting them across two hooks lets
 * a panel describe one calendar while pricing off another (that is how the
 * 7-day strip once disagreed with the tier badge mid-fetch).
 */
export interface HolidayView {
    index: HolidayIndex;
    calendars: HolidayCalendar[];
    status: HolidayStatus;
}
/** Merged lookup over the live calendars plus the persisted manual overrides. */
export declare function useHolidayView(overrides: readonly HolidayOverride[]): HolidayView;
/**
 * Billing state of one model at `at`, over the merged lookup. Re-renders
 * whenever the calendar or the overrides change, so a live tier badge stays
 * honest while the settings page is open.
 */
export declare function useBillingState(config: ModelConfig, index: HolidayIndex, at: number): BillingState;
/** Fetch the calendar once on mount when the cached copy is stale. */
export declare function useHolidayAutoFetch(enabled: boolean): void;
export {};
//# sourceMappingURL=holidays.d.ts.map