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
 *  4. the Chinese holiday / 调休 calendar (`/status-bar/api/holidays`) the
 *     client's peak/off-peak pricing needs — the dates are re-announced every
 *     year, so the host fetches the published dataset and caches it on disk.
 *
 * All pricing stays client-side (the user-maintained model price book).
 * @module @bananiceee/dsh-status-bar
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "@bananiceee/dsh-status-bar";
export declare const inject: string[];
/** Register the projections, the live rate projection, the usage ledger, and the plugin APIs. */
export declare function apply(ctx: Context): void;
