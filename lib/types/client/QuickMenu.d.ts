/**
 * Quick-toggle menu: a small gear button at the right end of the composer
 * tool row (`conversation.input.right`) that flips the master switch and
 * individual segments without opening Settings. Shares the same config store
 * as the bar and the settings page, so every surface stays in sync live.
 */
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
export type QuickMenuEntryProps = PropsRuntime<'conversation.input.right'> & PropsLocale<typeof NS>;
export declare const QuickMenuEntry: import("react").MemoExoticComponent<(props: QuickMenuEntryProps) => import("react").JSX.Element>;
//# sourceMappingURL=QuickMenu.d.ts.map