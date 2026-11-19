/**
 * The status bar itself: a composer-dock entry that takes over the shipped
 * `activity` cell (id 'activity', same order 0, lower priority) and renders
 * the configurable segment line. A second empty entry takes over the shipped
 * `usage` cell; the native ContextMeter is hidden by CSS only while this bar
 * renders its own context ring. Unloading the plugin or switching to the
 * native bar restores all three.
 *
 * Layout mirrors the shipped row: centered 12/20 tertiary text bounded to the
 * composer input card's width, with the context ring pinned to the right edge,
 * and the ellipsis + delayed hover tooltip as the narrow-column fallback. With
 * `wrap` enabled the text line reflows inside that same width and never
 * truncates — it never runs past the input box's edges in either mode.
 */
import type { IJobs } from '@deepseek-ai/dsh-api-job-controller/client';
import type { LiveRateSource } from './live-rate.ts';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import { NS } from './locales.ts';
import './projections.ts';
/**
 * Business face the bar's registration hands to the component: the client
 * jobs roster observable (synthesized into a `useJobs` selector hook) and the
 * reference-counted roster watcher. Both come from the `jobs` client service,
 * the same source the shipped header job list uses.
 */
export interface StatusBarInjected {
    hooks: {
        /** Live job rosters keyed by session id. */
        jobs: IJobs['state'];
        /** Live generation rate of the current stream, folded from the session event window. */
        liveRate: LiveRateSource;
    };
    /** Keep one session's roster current; returns the stop function. */
    watchRows: (sessionId: SessionId) => () => void;
    /** Follow one session's event window for the live TPS figure; returns the stop function. */
    watchLiveRate: (sessionId: SessionId) => () => void;
    /**
     * Release the plugin's dock takeover so the host's own `activity` / `usage`
     * cells render again; called by the bar's error boundary.
     */
    releaseDock: () => void;
}
/** Full props for the composer-dock entry (owner InputZone + standard kit + locale + jobs face). */
export type StatusBarDockEntryProps = PropsRuntime<'conversation.composer.dock'> & PropsLocale<typeof NS> & InjectFace<StatusBarInjected>;
export declare const StatusBarDockEntry: import("react").MemoExoticComponent<(props: StatusBarDockEntryProps) => import("react").JSX.Element | null>;
/**
 * The registered composer-dock entry: the bar inside an error boundary.
 *
 * The boundary sits above every hook the bar owns, so a throw in the bar's
 * body or in any segment/ring render is contained. Without it the host drops
 * the whole entry as crashed and — because the plugin shadows the native stats
 * cells — the user is left with no bar at all (issue #4).
 */
export declare function StatusBarDockEntryBoundary(props: StatusBarDockEntryProps): import("react").JSX.Element;
//# sourceMappingURL=StatusBar.d.ts.map