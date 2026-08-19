/**
 * dsh-status-bar client entry: installs the bar's stylesheet and locale, then
 * registers three surfaces —
 *  1. `conversation.composer.dock` id 'stats' at a LOWER priority: shadows the
 *     shipped stats line while this plugin is live (restores on unload).
 *  2. `conversation.input.right`: the quick-toggle gear menu.
 *  3. `settings.section`: the management page.
 */

import { en, NS, zh } from './locales.ts'
import { StatusBarDockEntry } from './StatusBar.tsx'
import { QuickMenuEntry } from './QuickMenu.tsx'
import { SettingsSection } from './SettingsSection.tsx'
import { UsageDialogEntry } from './UsageDialog.tsx'
// Type-only: the locale plugin's Context merge (ctx.locale) and the SlotMap
// merges that declare the conversation.* / settings.* seats.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'

/** Structural slots face (register/inject) — matches the runtime SlotRegistry. */
type SlotsService = {
  inject(key: string, callback: () => () => void): () => void
  register(options: Record<string, unknown>, component: unknown): () => void
}

type ClientContext = {
  slots: SlotsService
  locale: {
    register(ns: string, dictionaries: { zh: Record<string, string>; en: Record<string, string> }): void
    bind(ns: string): (key: string, params?: Record<string, string | number>) => string
  }
  effect(fn: () => void | (() => void), label: string): void
}

/** Bar + manager styles. Class names are prefixed `dsb-` to stay collision-free. */
const STYLES = `
.dsb-bar {
  display: block;
  text-align: center;
  width: 100%;
  /* Bound to the composer input card so the bar never runs past the input
     box's edges: single-line mode elides within this cap, wrap mode (below)
     reflows inside it. The composer context provides
     --dsh-composer-card-max-width; the fallback only serves the settings
     preview, whose own box is narrower than 780px anyway. */
  max-width: var(--dsh-composer-card-max-width, 780px);
  margin: 0 auto;
  box-sizing: border-box;
  padding: 4px 0 0;
  font-size: 12px;
  line-height: 20px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.dsb-bar.dsb-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 10px;
  row-gap: 2px;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}
.dsb-sep {
  color: var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.25));
}
.dsb-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: 1px;
  box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 12%, transparent);
}
.dsb-seg {
  display: inline-block;
  max-width: 100%;
}
.dsb-quick {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #c8ccd4);
  cursor: pointer;
}
.dsb-quick:hover,
.dsb-quick[aria-expanded="true"] {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #c8ccd4) 14%, transparent);
  color: var(--dsw-alias-label-primary, #e8eaee);
}
.dsb-set-page {
  max-width: 680px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dsw-alias-label-primary, #e8eaee);
}
.dsb-set-intro {
  margin: 0 0 14px;
  color: var(--dsw-alias-label-secondary, #c8ccd4);
}
.dsb-set-heading {
  margin: 18px 0 4px;
  font-size: 13px;
  font-weight: 600;
}
.dsb-set-hint {
  margin: 2px 0 8px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
}
.dsb-set-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.dsb-set-check input {
  accent-color: var(--dsw-alias-brand-primary, #4176e6);
}
.dsb-set-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 6px 0;
}
.dsb-set-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 3px 6px;
  border-radius: 6px;
}
.dsb-set-row:hover {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #c8ccd4) 8%, transparent);
}
.dsb-set-row .dsb-set-check {
  min-width: 150px;
}
.dsb-set-row .dsb-set-hint {
  flex: 1;
  margin: 0;
}
.dsb-set-arrows {
  display: inline-flex;
  gap: 2px;
}
.dsb-set-arrows button {
  width: 22px;
  height: 22px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #c8ccd4);
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
}
.dsb-set-arrows button:disabled {
  opacity: 0.35;
  cursor: default;
}
.dsb-set-cost {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  margin: 6px 0;
}
.dsb-set-price {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-set-price input,
.dsb-set-price select {
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1a1d24);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 12px;
  height: 30px;
  box-sizing: border-box;
  color-scheme: light dark;
}
.dsb-set-price input:focus,
.dsb-set-price select:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #4176e6);
}
.dsb-set-price select option {
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-set-preview {
  margin: 6px 0 14px;
  padding: 6px 10px;
  border: 1px dashed var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.16));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.dsb-set-fetch {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 0 10px;
  flex-wrap: wrap;
}
.dsb-set-fetch .dsb-set-hint {
  margin: 0;
}
.dsb-set-msg {
  margin: 4px 0 10px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4176e6) 10%, transparent);
  color: var(--dsw-alias-label-secondary, #5b6472);
  white-space: pre-wrap;
  word-break: break-all;
}
.dsb-set-window-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.dsb-set-windows {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 4px 0 10px;
}
.dsb-set-window {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.dsb-set-window .dsb-set-price {
  flex: 1;
}
.dsb-set-window-del {
  width: 28px;
  height: 30px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5b6472);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}
.dsb-set-window-del:hover:not(:disabled) {
  border-color: #e5484d;
  color: #e5484d;
}
.dsb-set-window-del:disabled {
  opacity: 0.35;
  cursor: default;
}
.dsb-set-msg.ok {
  background: color-mix(in srgb, #2ecc71 12%, transparent);
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-set-reset:disabled {
  opacity: 0.5;
  cursor: default;
}
.dsb-set-reset {
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  color: var(--dsw-alias-label-secondary, #5b6472);
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  cursor: pointer;
}
.dsb-set-reset:hover {
  border-color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-usage-modal {
  width: min(1080px, calc(100vw - 48px));
}
.dsb-usage-modal .dsb-usage-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  /* The panel's content box is narrower than the viewport (panel padding),
     so sizing against the viewport overflows the panel and its
     overflow:hidden clips the right edge (e.g. the table's cost column).
     Size against the panel content box instead. */
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  max-height: min(80vh, 760px);
  overflow-y: auto;
  padding-right: 4px;
}
.dsb-chart-card {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dsb-chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.dsb-chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-chart-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dsb-chart-periods {
  display: inline-flex;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  overflow: hidden;
}
.dsb-chart-periods button {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5b6472);
  font-size: 12px;
  padding: 4px 12px;
  cursor: pointer;
}
.dsb-chart-periods button.active {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4176e6) 14%, transparent);
  color: var(--dsw-alias-brand-primary, #4176e6);
  font-weight: 600;
}
.dsb-chart-nav {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.dsb-chart-nav button {
  width: 24px;
  height: 24px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5b6472);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}
.dsb-chart-nav button:disabled {
  opacity: 0.35;
  cursor: default;
}
.dsb-chart-period-label {
  min-width: 110px;
  text-align: center;
  font-size: 12px;
  color: var(--dsw-alias-label-primary, #1a1d24);
  font-variant-numeric: tabular-nums;
}
.dsb-chart {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 170px;
  padding-top: 6px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  min-width: 560px;
  overflow-x: auto;
}
.dsb-chart-col-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  height: 100%;
}
.dsb-chart-col {
  width: 100%;
  max-width: 26px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: 2px 2px 0 0;
  background: color-mix(in srgb, var(--dsw-alias-label-tertiary, #9aa0aa) 18%, transparent);
  min-height: 2px;
}
.dsb-chart-seg {
  width: 100%;
}
.dsb-chart-xlabel {
  font-size: 9px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dsb-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.dsb-chart-legend-swatch {
  width: 9px;
  height: 9px;
  border-radius: 2px;
}
.dsb-chart-legend-cost {
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-chart-unpriced {
  color: #e5484d;
}
.dsb-chart-error {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dsb-chart-error .dsb-usage-empty {
  padding: 0;
}
.dsb-usage-hero {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 18px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
}
.dsb-usage-hero-label {
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
}
.dsb-usage-cost-num {
  font-size: 34px;
  font-weight: 650;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-usage-hero-missing {
  font-size: 13px;
  color: #e5484d;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dsb-usage-hero-missing .dsb-usage-hero-wait {
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-usage-hero-add {
  font-size: 12px;
  line-height: 1;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1a1d24);
  cursor: pointer;
}
.dsb-usage-hero-add:hover {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #5b6472) 8%, transparent);
}
.dsb-usage-hero-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.dsb-usage-model-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #5b6472) 12%, transparent);
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-usage-peak {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: color-mix(in srgb, #5b8def 14%, transparent);
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-usage-peak.on {
  background: color-mix(in srgb, #e8b339 16%, transparent);
  color: #a06a00;
}
.dsb-usage-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.dsb-usage-stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
}
.dsb-usage-stat-value {
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-usage-stat-label {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
}
.dsb-usage-stat-hint {
  font-size: 10px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
}
.dsb-usage-prices {
  display: flex;
  align-items: center;
  gap: 8px 14px;
  flex-wrap: wrap;
  width: fit-content;
  max-width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #5b6472);
  font-variant-numeric: tabular-nums;
}
.dsb-usage-prices-title {
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1d24);
  margin-right: 6px;
}
.dsb-usage-price-src {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4176e6) 12%, transparent);
}
.dsb-usage-history-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-usage-table-wrap {
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  overflow-x: auto;
}
.dsb-usage-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.dsb-usage-table th,
.dsb-usage-table td {
  padding: 7px 10px;
  text-align: left;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));
  white-space: nowrap;
}
.dsb-usage-table th {
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
  font-weight: 500;
}
.dsb-usage-table td.num,
.dsb-usage-table th.num {
  text-align: right;
  white-space: nowrap;
}
.dsb-usage-table td:nth-child(3),
.dsb-usage-table th:nth-child(3),
.dsb-usage-table td:nth-child(4),
.dsb-usage-table th:nth-child(4),
.dsb-usage-table td:nth-child(5),
.dsb-usage-table th:nth-child(5) {
  min-width: 84px;
}
.dsb-usage-table td:nth-child(1),
.dsb-usage-table th:nth-child(1) {
  min-width: 88px;
}
.dsb-usage-table td:nth-child(2),
.dsb-usage-table th:nth-child(2) {
  min-width: 132px;
}
.dsb-usage-table td.model {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsb-model-add {
  margin: 8px 0 4px;
}
.dsb-model-add-row {
  display: flex;
  gap: 8px;
}
.dsb-model-add-row input {
  flex: 1;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1a1d24);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  height: 30px;
  box-sizing: border-box;
}
.dsb-model-currency {
  margin: 10px 0 4px;
  max-width: 200px;
}
.dsb-model-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0;
}
.dsb-model-card {
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  overflow: hidden;
}
.dsb-model-card.current {
  border-color: var(--dsw-alias-brand-primary, #4176e6);
}
.dsb-model-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}
.dsb-model-toggle {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  text-align: left;
  flex-wrap: wrap;
}
.dsb-model-name {
  font-size: 13px;
  font-weight: 600;
  font-family: ui-monospace, monospace;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-model-current {
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4176e6) 14%, transparent);
  color: var(--dsw-alias-brand-primary, #4176e6);
}
.dsb-model-del {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}
.dsb-model-del:hover {
  color: #e5484d;
  background: color-mix(in srgb, #e5484d 10%, transparent);
}
.dsb-model-body {
  padding: 0 12px 12px;
  border-top: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));
  padding-top: 10px;
}
.dsb-usage-pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
.dsb-usage-pager span {
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
}
.dsb-usage-pager button {
  min-width: 64px;
  height: 28px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5b6472);
  font-size: 12px;
  cursor: pointer;
}
.dsb-usage-pager button:hover:not(:disabled) {
  border-color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-usage-pager button:disabled {
  opacity: 0.4;
  cursor: default;
}
.dsb-usage-empty {
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
  padding: 10px 0;
}
`

function installStyles(): () => void {
  const style = document.createElement('style')
  style.dataset.plugin = 'dsh-status-bar'
  style.textContent = STYLES
  document.head.appendChild(style)
  return () => { style.remove() }
}

/** Client services required by this plugin. */
export const inject = ['slots', 'locale']

/** Register the bar, the quick menu, and the management page. */
export function apply(ctx: ClientContext): void {
  ctx.effect(installStyles, 'dsh-status-bar: styles')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-status-bar: locale')

  // The bar shadows the shipped `stats` cell: same id, lower priority, so it
  // renders while this plugin is live and the built-in line returns on unload.
  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({ name: 'conversation.composer.dock', id: 'stats', priority: -1, order: 0, locale: NS }, StatusBarDockEntry))
  // Quick-toggle gear at the right end of the composer tool row, next to it
  // the usage & cost dialog button.
  ctx.slots.inject('conversation.input.right', () => ctx.slots.register({ name: 'conversation.input.right', id: 'status-bar-quick', order: 950, locale: NS }, QuickMenuEntry))
  ctx.slots.inject('conversation.input.right', () => ctx.slots.register({ name: 'conversation.input.right', id: 'status-bar-usage', order: 951, locale: NS }, UsageDialogEntry))

  // Management page inside Settings → Plugins.
  ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: 'status-bar', order: 40, label: () => ctx.locale.bind(NS)('nav'), locale: NS }, SettingsSection))
}
