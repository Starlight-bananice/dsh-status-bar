/**
 * Status-bar configuration: segment registry, the user-maintained model
 * price book (each model carries its own prices AND peak/off-peak schedule),
 * and a tiny localStorage-backed store with useSyncExternalStore reactivity
 * so the bar, the usage dialog, and the settings page stay consistent live.
 */
import type { LocaleKeysOf } from '@deepseek-ai/dsh-client-ui-slots';
import type { NS } from './locales.ts';
import type { HolidayOverride, ModelConfig, PeakHourWindow } from './pricing-types.ts';
export type { DayType, HolidayCalendar, HolidayOverride, ModelConfig, OverrideKind, PeakHourWindow, } from './pricing-types.ts';
export declare const STORAGE_KEY = "dsh.statusBar.v1";
/** Current persisted schema version; v2 added the day-type pricing rules. */
export declare const CONFIG_VERSION = 2;
/** Every segment the bar can render, in stable registry order. */
export declare const SEGMENT_IDS: readonly ["status", "model", "title", "workspace", "counts", "durations", "speeds", "cacheHit", "tokens", "context", "tps", "sessionTime", "cost", "jobs", "queue", "errors"];
export type SegmentId = (typeof SEGMENT_IDS)[number];
/** Dictionary key type of this plugin's locale namespace. */
export type StatusBarKey = LocaleKeysOf<typeof NS>;
export interface SegmentMeta {
    /** Display name shown in the manager UI (locale key). */
    label: StatusBarKey;
    /** One-line hint shown under the manager row (locale key). */
    hint: StatusBarKey;
    /** Whether the segment ships enabled by default. */
    defaultOn: boolean;
}
/** Segment display metadata; the manager page renders one row per segment. */
export declare const SEGMENT_META: Record<SegmentId, SegmentMeta>;
export type Currency = 'CNY' | 'USD';
export declare function nextPeakWindowId(): string;
/**
 * Default peak windows for a newly added model: DeepSeek's published schedule
 * (09:00–12:00 and 14:00–18:00 Beijing time, working days only).
 */
export declare const DEFAULT_PEAK_WINDOWS: readonly PeakHourWindow[];
/** DeepSeek's published CNY rates per 1M tokens (flash, peak / off-peak). */
export declare const DEEPSEEK_RATES: {
    readonly peakInput: 2;
    readonly peakCacheRead: 0.04;
    readonly peakOutput: 8;
    readonly offpeakInput: 1;
    readonly offpeakCacheRead: 0.02;
    readonly offpeakOutput: 4;
};
export interface CostPrices {
    currency: Currency;
    /** User-maintained price book: model id → its prices & peak schedule. */
    models: Record<string, ModelConfig>;
}
export interface CalendarConfig {
    /**
     * Apply the day-aware rules: weekends and statutory holidays / 调休 rest days
     * are billed off-peak all day, and peak windows only run on working days.
     * Off = plain clock-window pricing, exactly as before day types existed.
     */
    dayRules: boolean;
    /** Fetch the published holiday calendar from the plugin host route. */
    autoFetch: boolean;
    /** Manual per-date overrides (holiday ↔ workday) the calendar cannot know. */
    overrides: HolidayOverride[];
}
export interface StatusBarConfig {
    /** Persisted schema version (see {@link CONFIG_VERSION}). */
    version: number;
    /** Master switch: false hides the bar entirely. */
    enabled: boolean;
    /** Allow the bar to wrap onto multiple lines instead of eliding. */
    wrap: boolean;
    /** Ordered list of enabled segments. */
    segments: SegmentId[];
    cost: CostPrices;
    /** Holiday-calendar behavior shared by every model. */
    calendar: CalendarConfig;
}
export declare const DEFAULT_CONFIG: StatusBarConfig;
/** Sanitize one model config (fills defaults for missing/invalid fields). */
export declare function normalizeModelConfig(raw: Partial<ModelConfig> | undefined): ModelConfig;
export declare function subscribeConfig(listener: () => void): () => void;
export declare function getConfig(): StatusBarConfig;
/** Apply a partial update (immutable replace) and persist. */
export declare function updateConfig(patch: Partial<StatusBarConfig>): void;
/** Toggle one segment's membership in the ordered enabled list. */
export declare function toggleSegment(id: SegmentId): void;
/** Move a segment one position in the enabled order (clamped at the ends). */
export declare function moveSegment(id: SegmentId, delta: -1 | 1): void;
/** Reset the bar/price book to defaults but keep manual holiday overrides. */
export declare function resetConfig(): void;
/** The price-book entry for one model, or undefined when unconfigured. */
export declare function modelConfigFor(cost: CostPrices, model: string | undefined): ModelConfig | undefined;
/** Add or update one model's price-book entry (merge semantics). */
export declare function setModelConfig(model: string, patch: Partial<ModelConfig>): void;
/** Remove one model from the price book. */
export declare function removeModelConfig(model: string): void;
/** Apply a partial update to the shared holiday-calendar settings. */
export declare function updateCalendar(patch: Partial<CalendarConfig>): void;
/** Add or replace the manual override for one date. */
export declare function setHolidayOverride(date: string, kind: HolidayOverride['kind'], label?: string): void;
/** Drop the manual override for one date (back to the published calendar). */
export declare function removeHolidayOverride(date: string): void;
/** Reset one model's schedule to DeepSeek's published peak/off-peak rules. */
export declare function applyDeepSeekPreset(model: string): void;
/** Reactive read for React components (bar, usage dialog, settings page). */
export declare function useStatusBarConfig(): StatusBarConfig;
//# sourceMappingURL=config.d.ts.map