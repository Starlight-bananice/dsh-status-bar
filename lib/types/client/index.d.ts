/**
 * dsh-status-bar client entry: installs the bar's stylesheet and locale, then
 * registers three surfaces —
 *  1. `conversation.composer.dock` id 'stats' at a LOWER priority: shadows the
 *     shipped stats line while this plugin is live (restores on unload).
 *  2. `conversation.input.right`: the quick-toggle gear menu.
 *  3. `settings.section`: the management page.
 */
import type { IJobs } from '@deepseek-ai/dsh-api-job-controller/client';
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Structural slots face (register/inject) — matches the runtime SlotRegistry. */
type SlotsService = {
    inject(key: string, callback: () => () => void): () => void;
    register(options: Record<string, unknown>, component: unknown): () => void;
};
type ClientContext = {
    slots: SlotsService;
    locale: {
        register(ns: string, dictionaries: {
            zh: Record<string, string>;
            en: Record<string, string>;
        }): void;
        bind(ns: string): (key: string, params?: Record<string, string | number>) => string;
    };
    /** Job Controller client face: the live rosters and their reference-counted watchers. */
    jobs: {
        readonly state: IJobs['state'];
        watchRows(sessionId: SessionId): () => void;
    };
    /** Session Controller client face: retaining the current session opens its live event window. */
    sessions: ISessions;
    effect(fn: () => void | (() => void), label: string): void;
};
/** Client services required by this plugin. */
export declare const inject: string[];
/** Register the bar, the quick menu, and the management page. */
export declare function apply(ctx: ClientContext): void;
export {};
//# sourceMappingURL=index.d.ts.map