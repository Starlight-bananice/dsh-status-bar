/**
 * dsh-status-bar — DSH 底栏管理插件（host 侧）。
 *
 * Host side provides three things the browser cannot:
 *  1. the `sessionModel` projection — the last model that produced an
 *     assistant message (the client snapshot's assistant nodes carry no
 *     provenance, so the bar reads this fold instead);
 *  2. the `liveTokenUsage` projection — the real-time generation rate of the
 *     current stream, folded from the `assistant/chunk` feed and served over
 *     the projection registry (DSH's live-state channel), so the bar's TPS
 *     segment tracks the stream chunk by chunk without any external
 *     live-stats plugin;
 *  The `sessionUsage` projection — whole-session per-model usage plus a
 *  per-step model/time ledger — lets the client price each step with the
 *  model that actually produced it (and that model's peak schedule).
 *  3. a usage ledger — subscribes the global `session/event` feed, persists
 *     every assistant message's provider-reported token usage to a JSONL
 *     file in the plugin's local data directory (~/.dsh/dsh-status-bar),
 *     and serves per-period per-model buckets to the usage dialog chart via
 *     `/status-bar/api/usage`.
 *
 * All pricing stays client-side (the user-maintained model price book).
 * @module dsh-status-bar
 */
import type { Context } from 'cordis';
export declare const name = "dsh-status-bar";
export declare const inject: string[];
/** Register the model projection, the live rate projection, the usage ledger, and the chart API. */
export declare function apply(ctx: Context): void;
