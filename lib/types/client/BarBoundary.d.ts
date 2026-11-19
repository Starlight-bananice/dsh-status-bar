/**
 * Error boundary around the composer-dock takeover.
 *
 * The plugin registers its bar at a LOWER priority under the host's own
 * `activity` / `usage` ids, so while it is mounted the native stats cells are
 * shadowed. Anything that throws inside the bar therefore does not degrade to
 * "a missing segment": the host marks the slot entry crashed, skips it, and
 * the native cells stay shadowed — the user is left with no status bar at all
 * (the failure mode reported in issue #4).
 *
 * This boundary contains that blast radius: the first failed render releases
 * the takeover, the native bar returns, and the plugin's other surfaces (the
 * gear menu, the settings page, the usage dialog) keep working. Retrying is a
 * normal settings change — every explicit config change re-registers the
 * takeover.
 */
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
export interface BarBoundaryProps {
    /** Release the dock takeover so DSH's own stats cells render again. */
    onFailure: () => void;
    children: ReactNode;
}
interface BarBoundaryState {
    failed: boolean;
}
export declare class BarBoundary extends Component<BarBoundaryProps, BarBoundaryState> {
    state: BarBoundaryState;
    static getDerivedStateFromError(): BarBoundaryState;
    componentDidCatch(error: unknown, info: ErrorInfo): void;
    render(): ReactNode;
}
export {};
//# sourceMappingURL=BarBoundary.d.ts.map