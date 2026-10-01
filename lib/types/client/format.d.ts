/**
 * Display formatters for the status bar. All pure, locale-agnostic helpers
 * (the bar's text is assembled in segments.ts with the bound dictionary).
 */
/** Compact token count: 517 / 12.2K / 517K / 1.2M (one decimal under three digits). */
export declare function formatTokens(n: number): string;
/** Compact duration: 45.2s under a minute, 2m42s from there on. */
export declare function formatDuration(ms: number): string;
/** Throughput with one decimal below 100 tok/s (matches the shipped TPS row). */
export declare function formatTokensPerSecond(value: number): string;
/**
 * Adaptive cost rendering: whole numbers below 100 keep two decimals, small
 * amounts keep their meaningful digits (0.0123), big totals round to whole.
 */
export declare function formatCost(value: number, currency: 'CNY' | 'USD'): string;
//# sourceMappingURL=format.d.ts.map