/**
 * Live "which tier applies right now, and why" badge, shared by the usage
 * dialog and the settings price book. Renders nothing when the model bills a
 * flat rate. The reason words are what makes the peak/off-peak math auditable:
 * a user sees 谷时（法定节假日）or 谷时（调休上班）instead of an unexplained number.
 */
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { ModelConfig } from './config.ts';
import { type BillingState, type HolidayIndex } from './timezone.ts';
import { NS } from './locales.ts';
export type StatusPillProps = {
    config: ModelConfig;
    state: BillingState;
    index: HolidayIndex;
    now: number;
    t: PropsLocale<typeof NS>['t'];
    /** Hide the clock/window detail (compact contexts). */
    compact?: boolean;
};
export declare const StatusPill: import("react").MemoExoticComponent<({ config, state, index, now, t, compact, }: StatusPillProps) => import("react").JSX.Element | null>;
//# sourceMappingURL=StatusPill.d.ts.map