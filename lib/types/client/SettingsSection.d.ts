/**
 * Status-bar management page (`settings.section` entry): master switch,
 * wrap toggle, per-segment checkboxes with reordering, the user-maintained
 * model price book (each model owns its prices AND its peak schedule), and the
 * shared holiday calendar that drives DeepSeek's working-day rules.
 * Writes the same localStorage store as the bar and the usage dialog.
 */
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
import './projections.ts';
export type SettingsSectionProps = PropsRuntime<'settings.section'> & PropsLocale<typeof NS>;
export declare const SettingsSection: import("react").MemoExoticComponent<(props: SettingsSectionProps) => import("react").JSX.Element>;
//# sourceMappingURL=SettingsSection.d.ts.map