/**
 * dsh-status-bar — DSH 底栏管理插件（host 侧）。
 *
 * Host side provides the durable folds the browser cannot compute from its
 * window alone:
 *  1. the `sessionModel` projection — the last model that produced an
 *     assistant message (the client snapshot's assistant nodes carry no
 *     provenance, so the bar reads this fold instead);
 *  2. the `sessionUsage` projection — whole-session per-model usage plus a
 *  per-step model/time ledger — lets the client price each step with the
 *  model that actually produced it (and that model's peak schedule).
 *  3. a usage ledger — subscribes the global `session/event` feed, persists
 *     every assistant message's provider-reported token usage to a JSONL
 *     file in the plugin's local data directory (~/.dsh/dsh-status-bar),
 *     and serves per-period per-model buckets to the usage dialog chart via
 *     `/status-bar/api/usage`.
 *
 * All pricing stays client-side (the user-maintained model price book).
 * @module @bananiceee/dsh-status-bar
 */

import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-session-projection'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import { sessionModelProjectionDefinition } from './model-projection.ts'
import { sessionUsageProjectionDefinition } from './session-usage.ts'
import { ledgerDataDir, UsageLedger, type UsagePeriod } from './usage-ledger.ts'

export const name = '@bananiceee/dsh-status-bar'
export const inject = ['sessionProjections', 'webServer']

function json(res: import('node:http').ServerResponse, status: number, body: unknown): void {
  const text = JSON.stringify(body)
  // Connection: close — every response gets a fresh connection. In this
  // deployment the webserver's 5s keep-alive can leave half-open sockets in
  // the browser pool, and a pooled request then hangs forever (async fetch
  // stalls, page freezes). Short, infrequent JSON calls don't need pooling.
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'connection': 'close',
  })
  res.end(text)
}

const PERIODS: readonly UsagePeriod[] = ['day', 'week', 'month']

/** Register the model projection, the live rate projection, the usage ledger, and the chart API. */
export function apply(ctx: Context): void {
  ctx.effect(() => ctx.sessionProjections.register(sessionModelProjectionDefinition), 'dsh-status-bar: sessionModel projection')
  // Whole-session per-model usage (+ per-step model/time ledger) for accurate
  // per-model / per-step cost pricing client-side.
  ctx.effect(() => ctx.sessionProjections.register(sessionUsageProjectionDefinition), 'dsh-status-bar: sessionUsage projection')
  // Usage ledger: fold every committed assistant message into the local
  // JSONL-backed hourly store (feed listener + API share the instance).
  const ledger = new UsageLedger(ledgerDataDir(process.env.DSH_HOME))
  ctx.on('session/event', (_session, event: SessionEvent) => {
    ledger.record(event)
  })

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/status-bar/api',
    handler: async (req, res) => {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1')
      if (url.pathname !== '/status-bar/api/usage') {
        json(res, 404, { error: 'not-found' })
        return
      }
      const period = url.searchParams.get('period') as UsagePeriod | null
      if (period === null || !PERIODS.includes(period)) {
        json(res, 400, { error: 'invalid-period' })
        return
      }
      const rawOffset = Number(url.searchParams.get('offset') ?? '0')
      const offset = Number.isInteger(rawOffset) && rawOffset >= 0 ? rawOffset : 0
      json(res, 200, ledger.query(period, offset))
    },
  }), 'dsh-status-bar: usage chart API')
}
