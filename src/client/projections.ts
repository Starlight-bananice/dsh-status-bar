/**
 * Projection-key declarations this plugin reads. The type-only imports pull
 * the durable projection table entries (sessionStats / tokenUsage /
 * contextPressure) and the local augmentation adds the two folds THIS
 * plugin's host side serves over the projection registry. The live TPS figure
 * is NOT here: 0.2.0-rc.2 has no durable `assistant/chunk` event, so the live
 * rate is folded client-side from the session's event window instead (see
 * ./live-rate.ts).
 */

import type {} from '@deepseek-ai/dsh-session-stats/client'
import type {} from '@deepseek-ai/dsh-token-meter/client'
import type {} from '@deepseek-ai/dsh-session-projection/types'

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
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
