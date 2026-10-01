/**
 * Usage & cost dialog: a chart icon button at the right end of the composer
 * tool row (next to the quick-toggle gear) opens a modal with the current
 * conversation's provider-reported token usage, the estimated cost at the
 * current model's price-book entry (flat or peak/off-peak), and a recent
 * per-step usage history table — OpenAI-usage-panel style, but fed entirely
 * by DSH's own accounting.
 */
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
import './projections.ts';
export type UsageDialogEntryProps = PropsRuntime<'conversation.input.right'> & PropsLocale<typeof NS>;
export declare const UsageDialogEntry: import("react").MemoExoticComponent<(props: UsageDialogEntryProps) => import("react").JSX.Element>;
//# sourceMappingURL=UsageDialog.d.ts.map