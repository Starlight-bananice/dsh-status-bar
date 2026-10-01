/**
 * Status-bar configuration: segment registry, the user-maintained model
 * price book (each model carries its own prices AND peak/off-peak schedule),
 * and a tiny localStorage-backed store with useSyncExternalStore reactivity
 * so the bar, the usage dialog, and the settings page stay consistent live.
 */
import type { LocaleKeysOf } from '@deepseek-ai/dsh-client-ui-slots';
import type { NS } from './locales.ts';
export declare const STORAGE_KEY = "dsh.statusBar.v1";
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
/** One peak window (may cross midnight); times are 'HH:MM' in the model's timezone. */
export interface PeakWindow {
    id: string;
    start: string;
    end: string;
}
/** Fresh id for a peak window row. */
export declare function nextPeakWindowId(): string;
/** Default peak windows for a newly added model (DeepSeek's official schedule). */
export declare const DEFAULT_PEAK_WINDOWS: PeakWindow[];
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
    /** IANA timezone (or 'local') this model's peak windows are evaluated in. */
    timezone: string;
    peakWindows: PeakWindow[];
    peakInput: number;
    peakCacheRead: number;
    peakOutput: number;
    offpeakInput: number;
    offpeakCacheRead: number;
    offpeakOutput: number;
}
export interface CostPrices {
    currency: Currency;
    /** User-maintained price book: model id → its prices & peak schedule. */
    models: Record<string, ModelConfig>;
}
export interface StatusBarConfig {
    /** Master switch: false hides the bar entirely. */
    enabled: boolean;
    /** Allow the bar to wrap onto multiple lines instead of eliding. */
    wrap: boolean;
    /** Ordered list of enabled segments. */
    segments: SegmentId[];
    cost: CostPrices;
}
export declare const DEFAULT_CONFIG: StatusBarConfig;
export declare function subscribeConfig(listener: () => void): () => void;
export declare function getConfig(): StatusBarConfig;
/** Apply a partial update (immutable replace) and persist. */
export declare function updateConfig(patch: Partial<StatusBarConfig>): void;
/** Toggle one segment's membership in the ordered enabled list. */
export declare function toggleSegment(id: SegmentId): void;
/** Move a segment one position in the enabled order (clamped at the ends). */
export declare function moveSegment(id: SegmentId, delta: -1 | 1): void;
export declare function resetConfig(): void;
/** The price-book entry for one model, or undefined when unconfigured. */
export declare function modelConfigFor(cost: CostPrices, model: string | undefined): ModelConfig | undefined;
/** Add or update one model's price-book entry (merge semantics). */
export declare function setModelConfig(model: string, patch: Partial<ModelConfig>): void;
/** Remove one model from the price book. */
export declare function removeModelConfig(model: string): void;
/** Reactive read for React components (bar, usage dialog, settings page). */
export declare function useStatusBarConfig(): StatusBarConfig;
//# sourceMappingURL=config.d.ts.map