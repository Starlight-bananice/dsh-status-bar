/**
 * DSH's composer context-occupancy ring, ported into the plugin bar.
 *
 * The shipped `ContextMeter` is a sibling of the composer dock, not a slot
 * entry, so the plugin could previously only hide it. This component recreates
 * the same ring, percentage, tooltip and click-open breakdown panel from the
 * `contextPressure` / `contextBreakdown` projections, and the bar pins it to
 * the right edge. Turning the `context` segment off (or switching to native
 * mode) releases it, and the shipped meter takes over again.
 *
 * Geometry and presentation mirror the DSH 0.2.1 component: a 14px ring with
 * a 2px stroke, a right-aligned percentage, and a 264px anchored panel with
 * the system / tools / messages composition.
 */
import type { ContextBreakdownProjection, ContextPressureProjection } from '@deepseek-ai/dsh-token-meter/client';
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
type T = TranslateNS<typeof NS>;
/** The ring glyph alone; shared with the settings preview. */
export declare function RingGlyph({ percent }: {
    percent: number;
}): import("react").JSX.Element;
export interface ContextRingProps {
    pressure: ContextPressureProjection | undefined;
    breakdown: ContextBreakdownProjection | undefined;
    t: T;
}
export declare function ContextRing({ pressure, breakdown, t }: ContextRingProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=ContextRing.d.ts.map