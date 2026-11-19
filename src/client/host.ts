/**
 * Host UI primitives behind a shim that cannot take the bar down.
 *
 * The Client module table seeds `@deepseek-ai/dsh-client-ui-primitives`, but
 * which symbols survive a release is the host's call and this plugin cannot
 * pin it: DSH 0.2.2-rc.3 / NEXT 2.0.23 removed `useAnchoredPosition` (the
 * 0.2.0 hook this plugin was compiled against) with no replacement export.
 * A direct named import therefore turned into
 * `TypeError: ... useAnchoredPosition is not a function` on the first render
 * of the context ring, and because that throw happens inside the
 * `conversation.composer.dock` entry the host drops the WHOLE entry. The
 * plugin shadows the native stats cells at a lower priority, so the user loses
 * the plugin bar and the native figures at the same time (issue #4).
 *
 * Two defences, both owned by the plugin:
 *  1. Pure geometry/pointer behaviour is implemented here and no longer
 *     depends on the host at all: the anchored-position placement and the
 *     outside-pointer dismissal are ports of the 0.2.0 hooks they replace, so
 *     a host release can never remove them again.
 *  2. Host exports this plugin still uses are read as properties and fall back
 *     to a minimal local stand-in, so a renamed/re-exported primitive degrades
 *     one affordance instead of failing the slot entry.
 */

import { useEffect, useLayoutEffect, useState } from 'react'
import type { ComponentProps, ComponentType, ReactElement } from 'react'
import * as hostPrimitives from '@deepseek-ai/dsh-client-ui-primitives'

/** A React ref object as used by the positioning hooks. */
export interface ElementRef<T extends HTMLElement> {
  readonly current: T | null
}

/** Fixed viewport coordinates for a portaled panel. */
export interface AnchoredPosition {
  left: number
  top: number
}

/** Placement options; mirrors the DSH 0.2.0 API the bar was written against. */
export interface AnchoredPositionOptions {
  /** Whether the panel is mounted; false clears the returned coordinates. */
  open: boolean
  /** The element the panel hangs from. */
  anchorRef: ElementRef<HTMLElement>
  /** The portaled panel itself, measured for its own size. */
  panelRef: ElementRef<HTMLElement>
  /** Place the panel above or below the anchor. Defaults to 'bottom'. */
  side?: 'top' | 'bottom'
  /** Align the panel's left edge with the anchor's start or end. Defaults to 'start'. */
  align?: 'start' | 'end'
  /** Distance from the anchor in pixels. Defaults to 8. */
  gap?: number
  /** Minimum distance from the viewport edges. Defaults to 8. */
  margin?: number
}

/**
 * Top clearance a floating surface must clear in addition to the viewport
 * margin: the window's own title strip sits above the usable area, so a panel
 * clamped only to the viewport can land underneath it.
 */
function overlayTopMargin(min: number): number {
  const root = document.documentElement
  const clearance = Number.parseFloat(getComputedStyle(root).getPropertyValue('--dsh-frame-top-clearance'))
  if (Number.isNaN(clearance)) return min
  return Math.max(min, (root.hasAttribute('data-fullscreen') ? 0 : clearance) + 20)
}

/**
 * Keep a fixed-position floating element anchored to a trigger.
 *
 * A portaled panel is positioned from its anchor's viewport rect, which stops
 * being true the moment anything scrolls or the window resizes, so this
 * re-measures on scroll (capture phase, to catch scrollers nested in the
 * page), on resize, and on the panel's own size changes while open.
 *
 * @param options - the open state, both refs, the placement side/alignment and
 *   the gap/margin distances.
 * @returns `left`/`top` for the panel, or `null` before the first measurement.
 */
export function useAnchoredPosition(options: AnchoredPositionOptions): AnchoredPosition | null {
  const {
    open, anchorRef, panelRef, side = 'bottom', align = 'start', gap = 8, margin = 8,
  } = options
  const [position, setPosition] = useState<AnchoredPosition | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }
    const place = (): void => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (rect === undefined) return
      const panel = panelRef.current
      const width = panel?.offsetWidth ?? 0
      const height = panel?.offsetHeight ?? 0
      let left = align === 'end' ? rect.right - width : rect.left
      let top = side === 'top' ? rect.top - gap - height : rect.bottom + gap
      // A zero-sized panel is still being laid out; clamping to
      // `viewport - 0 - margin` would park it off screen, so skip until it has
      // a box.
      if (width > 0) left = Math.min(Math.max(left, margin), window.innerWidth - width - margin)
      if (height > 0) top = Math.min(Math.max(top, overlayTopMargin(margin)), window.innerHeight - height - margin)
      setPosition({ left: Math.round(left), top: Math.round(top) })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    const panel = panelRef.current
    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && panel !== null) {
      observer = new ResizeObserver(place)
      observer.observe(panel)
    }
    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open, anchorRef, panelRef, side, align, gap, margin])

  return position
}

/**
 * Close an open popover when a pointerdown lands outside its root.
 *
 * @param root - element containing the trigger (and the panel when it is not
 *   portaled).
 * @param open - whether the surface is showing; false detaches the listener.
 * @param setOpen - state setter invoked with false on an outside pointerdown.
 * @param portal - a panel portaled outside the root that also counts as
 *   inside; omit when the root contains the whole popover.
 */
export function useDismissOnOutsidePointer(
  root: ElementRef<HTMLElement>,
  open: boolean,
  setOpen: (open: boolean) => void,
  portal?: ElementRef<HTMLElement>,
): void {
  useEffect(() => {
    if (!open) return
    const closeOutside = (event: Event): void => {
      if (!(event.target instanceof Node)) return
      if (root.current?.contains(event.target) === true) return
      if (portal?.current?.contains(event.target) === true) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => { document.removeEventListener('pointerdown', closeOutside) }
  }, [root, open, setOpen, portal])
}

/** Props of the host tooltip, so the fallback stays drop-in compatible. */
export type TooltipProps = ComponentProps<typeof hostPrimitives.Tooltip>

/**
 * Stand-in used when the host stops exporting `Tooltip`: the anchor still
 * renders exactly as before and only the hover bubble is lost. Keeping the
 * element tree intact is the point — a missing primitive must not fail the
 * row it decorates.
 */
function FallbackTooltip({ children }: TooltipProps): ReactElement {
  return children
}

/** The host tooltip when it is really exported, otherwise the pass-through stand-in. */
export const Tooltip: ComponentType<TooltipProps> = typeof hostPrimitives.Tooltip === 'function'
  ? hostPrimitives.Tooltip
  : FallbackTooltip
