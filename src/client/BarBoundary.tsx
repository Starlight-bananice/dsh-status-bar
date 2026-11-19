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

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

export interface BarBoundaryProps {
  /** Release the dock takeover so DSH's own stats cells render again. */
  onFailure: () => void
  children: ReactNode
}

interface BarBoundaryState {
  failed: boolean
}

export class BarBoundary extends Component<BarBoundaryProps, BarBoundaryState> {
  override state: BarBoundaryState = { failed: false }

  static getDerivedStateFromError(): BarBoundaryState {
    return { failed: true }
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      '[dsh-status-bar] composer dock failed to render; releasing the takeover so the native bar returns',
      error,
      info.componentStack,
    )
    // The release re-renders the slot from outside this commit, so defer it
    // rather than removing a registration React is still committing.
    setTimeout(() => { this.props.onFailure() }, 0)
  }

  override render(): ReactNode {
    return this.state.failed ? null : this.props.children
  }
}
