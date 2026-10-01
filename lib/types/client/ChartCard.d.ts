/**
 * Per-model cost chart card: stacked bar chart of token costs inside the
 * usage dialog. Period switch (day = 24 hours, week = 7 days, month = days
 * of the month) plus previous/next period navigation; data comes from the
 * host usage ledger (`/status-bar/api/usage`) and is priced with the
 * user-maintained model price book (flat rates — peak/off-peak only applies
 * to the live moment, not to historical buckets).
 */
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import { type CostPrices } from './config.ts';
import { NS } from './locales.ts';
export type ChartPeriod = 'day' | 'week' | 'month';
export declare function modelColor(model: string): string;
export interface ChartCardProps {
    cost: CostPrices;
    t: PropsLocale<typeof NS>['t'];
}
export declare const ChartCard: import("react").MemoExoticComponent<({ cost, t }: ChartCardProps) => import("react").JSX.Element>;
//# sourceMappingURL=ChartCard.d.ts.map