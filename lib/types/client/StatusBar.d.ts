/**
 * The status bar itself: a composer-dock entry that shadows the shipped
 * `stats` cell (id 'stats', lower priority) and renders the configurable
 * segment line. Unloading the plugin restores the built-in stats line.
 *
 * Layout mirrors the shipped row: block, centered, 12/20 tertiary text,
 * bounded to the composer input card's width, with the ellipsis + delayed
 * hover tooltip as the narrow-column fallback. With `wrap` enabled the bar
 * becomes a flex-wrap line that reflows inside that same width and never
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
}
/** Full props for the composer-dock entry (owner InputZone + standard kit + locale + jobs face). */
export type StatusBarDockEntryProps = PropsRuntime<'conversation.composer.dock'> & PropsLocale<typeof NS> & InjectFace<StatusBarInjected>;
export declare const StatusBarDockEntry: import("react").MemoExoticComponent<(props: StatusBarDockEntryProps) => import("react").JSX.Element | null>;
//# sourceMappingURL=StatusBar.d.ts.map