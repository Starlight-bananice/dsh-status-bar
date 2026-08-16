/**
 * Projection-key declarations this plugin reads. The three type-only imports
 * pull the durable projection table entries (sessionStats / tokenUsage /
 * contextPressure); the local augmentation adds the live rate that THIS
 * plugin's host side serves over the projection registry — the DSH
 * live-state channel — folding `assistant/chunk` events as they commit, so
 * the TPS segment tracks the current stream chunk by chunk. The optional
 * marker keeps client-only assemblies (host unit absent) compiling, where
 * the segment falls back to the window's average decode rate.
 */

import type {} from '@deepseek-ai/dsh-session-stats/client'
import type {} from '@deepseek-ai/dsh-token-meter/client'
import type {} from '@deepseek-ai/dsh-session-projection/types'

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Live generation throughput (tok/s) served by this plugin's host-side live-rate fold. */
    liveTokenUsage?: { tokensPerSecond?: number }
    /** Last assistant-message model identity (host-side fold; absent until a message lands). */
    sessionModel?: { provider: string | null; model: string | null; updatedAt: number | null }
    /** Whole-session per-model usage plus the per-step model/time ledger (host-side fold). */
    sessionUsage?: {
      models: Record<string, {
        input: number
        cacheRead: number
        cacheWrite: number
        output: number
      }>
      bySeq: Record<string, {
        provider: string
        model: string
        time: number
      }>
    }
  }
}
