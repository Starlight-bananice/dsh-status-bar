# dsh-status-bar · Configurable status bar for the DSH composer dock

A management plugin for the DeepSeek Harness bottom bar: it replaces the
built-in stats line with 17 toggleable, reorderable segments and ships a
management settings page plus an in-composer quick-toggle menu.

- Hybrid plugin: the bar renders client-side (config kept in `localStorage`
  under `dsh.statusBar.v1`); the host side registers the `sessionModel` and
  `liveTokenUsage` projections, the usage ledger, and the usage-chart API
- The shipped `stats` cell is shadowed at a lower priority: while the plugin
  is live its bar renders; unloading restores the built-in line untouched

## Install

```sh
dsh plugin --profile web add ../dsh-status-bar   # profile assembly
# or runtime injection via dsh-super-injector / dev_inject_plugin
```

## Segments (17, all toggleable / reorderable)

| Segment | Shows | Source |
|---|---|---|
| Status | ● running / idle / error dot | snapshot `running` / `partial` / `lastAgentError` |
| Model | model of the latest response | `sessionModel` projection (host fold of assistant/message events) |
| Title | session title (truncated) | SessionSummary |
| Workspace | workspace dir name | SessionSummary |
| Agent preset | preset name | SessionSummary |
| Turns & steps | N turns · M steps | `sessionStats` projection (window-fold fallback) |
| Model & tool time | LLM · tool-call wall time | `sessionStats` |
| TTFT & decode | avg first token · tok/s | `sessionStats` |
| Cache hit | prompt cache-hit share (2 decimals, capped at 99.99%) | `tokenUsage` |
| Tokens | billed input/output totals | `tokenUsage` |
| Context | context-window occupancy % | `contextPressure` |
| Throughput TPS | live generation rate (default on) | `liveTokenUsage` projection — this plugin's host folds `assistant/chunk` events in real time (~4 chars/token while streaming, exact once the provider reports usage); the last rate is carried while idle |
| Session time | wall clock, ticks while running | `turnTimings` |
| Cost estimate | ≈¥0.0123 (off by default) | `tokenUsage` × the current model's effective price |
| Jobs | running background jobs | `jobsBySession` |
| Queue | queued messages | snapshot `queue` |
| Errors | failed/retried/over-limit count (>0 only) | node fold |

Default-on: status, counts, model, context, durations, speeds, cache hit,
tokens, TPS, session time, jobs, queue, errors. Cost defaults off.

## Cost estimate (model price book)

- **User-maintained**: in Settings → Status Bar → Model price book, add the
  models you use (any number); each model has its own per-1M-token rates
  (input / cache hit / cache write / output) and its own peak/off-peak
  schedule (timezone, multiple windows, peak/off-peak tiers).
- **Usage-based**: token usage comes from each API response (`tokenUsage`
  projection + per-node usage); cost = usage × the model's rates, and
  switching sessions automatically re-prices at that session's model.
- **Usage dialog**: a new «Usage & cost» button next to the settings gear in
  the composer tool row opens the current conversation's breakdown — total
  estimated cost, input/cache/output/hit-rate/context stat cards, the active
  model's rate card, and a paged (15/page) usage history table.
- **Cost trend chart**: a stacked bar chart in the dialog, colored per model,
  switchable between Day (24 hours) / Week (7 days) / Month (daily), with ‹ ›
  navigation into previous periods (yesterday / last week / last month). The
  host subscribes the `session/event` feed and persists the aggregated usage
  to the plugin's local data dir `~/.dsh/dsh-status-bar/usage.jsonl`, so it
  survives restarts; costs are estimated at the price book's flat rates.

## Throughput TPS (live states)

The TPS segment reads the `liveTokenUsage` projection, which this plugin's
host side serves over the DSH session-projection registry — the live-state
channel between host and browser:

- The host folds every committed `assistant/chunk` event, so the rate updates
  chunk by chunk while a stream is generating (no polling, no external
  live-stats plugin needed); the bar throttles the displayed figure to at
  most one refresh per 0.5 s
- While the provider has not reported usage the rate is estimated at
  ~4 chars/token; once a `usage` chunk lands mid-stream it becomes exact
- The rate is the running average since the stream's first output token, and
  the last measured rate is carried while idle — the segment never goes blank
  after the first stream; a stream retried by the agent loop (`llm/retry`
  marker) restarts its measurement window, so a stuck retry loop cannot keep
  inflating the value
- If `@linxin666/dsh-live-stats` is also loaded, both plugins serve the same
  `liveTokenUsage` key; the session-projection registry keeps whichever
  registered first (same key, one unit) — no duplicate rows

## Management UI

1. **Settings → Plugins → Status Bar**: master switch, wrap toggle, per-segment
   checkboxes with ↑↓ reordering, the model price book (add/remove models,
   per-model rates + peak/off-peak schedule), currency, sample preview, reset.
2. **Gear button at the right end of the composer tool row**: toggle any
   segment (or the bar itself) in place; the chart button next to it opens
   the usage & cost dialog.
3. Segments without data hide automatically.

## Development

```sh
npm run build          # junction links + host tsc + client typecheck
npm run build:client   # tsdown → lib/client.js (ModuleLoader bundle)
```

The build needs `DSH_CHECKOUT` (or a common-path probe) pointing at a dsh
source checkout; client typechecking resolves against the checkout's
`lib/types` through junction links.

## License

MIT
