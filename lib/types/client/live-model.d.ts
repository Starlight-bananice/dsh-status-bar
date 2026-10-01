/**
 * Last model the bar observed for the session in view.
 *
 * 0.2.0-rc.2 removed `SessionListState.current`, so a ROOT-scoped surface (the
 * Settings page) no longer has a global "current session" whose `sessionModel`
 * projection it could read. The session-scoped bar publishes what it sees
 * here, and the price-book section reads it back for its "current model"
 * preview. Absent means no session has rendered yet.
 */
/** Publish the model the bar currently shows (called by the session-scoped bar). */
export declare function noteCurrentModel(model: string | undefined): void;
/** Current model name for previews, or undefined before any session rendered. */
export declare function useCurrentModel(): string | undefined;
//# sourceMappingURL=live-model.d.ts.map