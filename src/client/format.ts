/**
 * Display formatters for the status bar. All pure, locale-agnostic helpers
 * (the bar's text is assembled in segments.ts with the bound dictionary).
 */

/** Compact token count: 517 / 12.2K / 517K / 1.2M (one decimal under three digits). */
export function formatTokens(n: number): string {
  const scaled = (v: number): string =>
    v >= 100 ? String(Math.round(v)) : String(Math.round(v * 10) / 10)
  if (n < 1_000) return String(n)
  if (n < 1_000_000) return `${scaled(n / 1_000)}K`
  return `${scaled(n / 1_000_000)}M`
}

/** Compact duration: 45.2s under a minute, 2m42s from there on. */
export function formatDuration(ms: number): string {
  const s = ms / 1_000
  if (s < 60) return `${Math.round(s * 10) / 10}s`
  const whole = Math.round(s)
  return `${Math.floor(whole / 60)}m${whole % 60}s`
}

/** Throughput with one decimal below 100 tok/s (matches the shipped TPS row). */
export function formatTokensPerSecond(value: number): string {
  return String(value < 100 ? Math.round(value * 10) / 10 : Math.round(value))
}

/**
 * Adaptive cost rendering: whole numbers below 100 keep two decimals, small
 * amounts keep their meaningful digits (0.0123), big totals round to whole.
 */
export function formatCost(value: number, currency: 'CNY' | 'USD'): string {
  const symbol = currency === 'CNY' ? '¥' : '$'
  let digits: number
  if (value >= 100) digits = 0
  else if (value >= 1) digits = 2
  else if (value >= 0.01) digits = 3
  else digits = 4
  return `${symbol}${value.toFixed(digits)}`
}
