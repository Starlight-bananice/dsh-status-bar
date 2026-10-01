/**
 * Last model the bar observed for the session in view.
 *
 * 0.2.0-rc.2 removed `SessionListState.current`, so a ROOT-scoped surface (the
 * Settings page) no longer has a global "current session" whose `sessionModel`
 * projection it could read. The session-scoped bar publishes what it sees
 * here, and the price-book section reads it back for its "current model"
 * preview. Absent means no session has rendered yet.
 */

import { useSyncExternalStore } from 'react'

let current: string | undefined
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

/** Publish the model the bar currently shows (called by the session-scoped bar). */
export function noteCurrentModel(model: string | undefined): void {
  if (model === current) return
  current = model
  for (const listener of [...listeners]) listener()
}

/** Current model name for previews, or undefined before any session rendered. */
export function useCurrentModel(): string | undefined {
  return useSyncExternalStore(subscribe, getCurrentModel, getCurrentModel)
}

/** Snapshot reader for the hook (client and hydration snapshot alike). */
function getCurrentModel(): string | undefined {
  return current
}
