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

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ContextBreakdownProjection, ContextPressureProjection } from '@deepseek-ai/dsh-token-meter/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import {
  Tooltip,
  useAnchoredPosition,
  useDismissOnOutsidePointer,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { StatusBarKey } from './config.ts'
import { formatTokens } from './format.ts'
import { NS } from './locales.ts'

type T = TranslateNS<typeof NS>

/** Ring geometry: 14px viewBox, 2px stroke. */
const RADIUS = 5.5
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Marker the localized occupancy sentence is split on, so the panel headline
 * keeps the reading in its own tone while each locale still owns the word
 * order (`45% of context used` / `上下文已用 45%`).
 */
const READING_SLOT = '\0'

/** Panel legend rows, in bar-segment order; each color class carries the shared swatch/segment tint. */
const ROWS: ReadonlyArray<{
  key: keyof ContextBreakdownProjection
  label: StatusBarKey
  color: string
}> = [
  { key: 'systemTokens', label: 'ring.system', color: 'dsb-ctx-color-system' },
  { key: 'toolsTokens', label: 'ring.tools', color: 'dsb-ctx-color-tools' },
  { key: 'messageTokens', label: 'ring.messages', color: 'dsb-ctx-color-messages' },
]

/** Resolve the occupancy reading from the pressure projection. */
function contextOccupancy(pressure: ContextPressureProjection | undefined): {
  percent: number
  usedTokens: number
  contextWindow: number
} | null {
  const usedTokens = pressure?.projectedTokens ?? pressure?.pressureTokens
  if (usedTokens === undefined || pressure?.contextWindow === undefined) return null
  return {
    percent: Math.min(100, Math.round(usedTokens / pressure.contextWindow * 100)),
    usedTokens,
    contextWindow: pressure.contextWindow,
  }
}

/** The ring glyph alone; shared with the settings preview. */
export function RingGlyph({ percent }: { percent: number }) {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden>
      <circle className="dsb-ctx-track" cx="7" cy="7" r={RADIUS} />
      <circle
        className="dsb-ctx-fill"
        cx="7"
        cy="7"
        r={RADIUS}
        strokeDasharray={`${CIRCUMFERENCE * percent / 100} ${CIRCUMFERENCE}`}
        transform="rotate(-90 7 7)"
      />
    </svg>
  )
}

export interface ContextRingProps {
  pressure: ContextPressureProjection | undefined
  breakdown: ContextBreakdownProjection | undefined
  t: T
}

export function ContextRing({ pressure, breakdown, t }: ContextRingProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLSpanElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const context = contextOccupancy(pressure)
  const available = context !== null
  const position = useAnchoredPosition({
    open: open && available,
    anchorRef: rootRef,
    panelRef,
    side: 'top',
    gap: 8,
    margin: 12,
  })
  useDismissOnOutsidePointer(rootRef, open && available, setOpen, panelRef)

  useEffect(() => {
    if (!available && open) setOpen(false)
  }, [available, open])

  useEffect(() => {
    if (!open || !available) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [available, open])

  if (context === null) return null
  const percent = context.percent
  const reading = `${percent}%`
  const [headBefore = '', headAfter = ''] = t('ring.aria', { percent: READING_SLOT })
    .split(READING_SLOT)
    .map(part => part.trim())
  const breakdownTotal = breakdown === undefined
    ? 0
    : breakdown.systemTokens + breakdown.toolsTokens + breakdown.messageTokens
  const segments = (breakdown === undefined || breakdownTotal === 0
    ? [{ key: 'total', color: undefined, width: percent }]
    : ROWS.map(row => ({
      key: row.key,
      color: row.color,
      width: percent * breakdown[row.key] / breakdownTotal,
    }))).filter(part => part.width > 0)

  return (
    <>
      <span ref={rootRef} className="dsb-ring">
        <Tooltip
          label={t('ring.aria', { percent: reading })}
          side="top"
          delayMs={200}
          disabled={open}
        >
          <button
            type="button"
            className="dsb-ctx-trigger"
            aria-label={t('ring.aria', { percent: reading })}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => { setOpen(!open) }}
          >
            <RingGlyph percent={percent} />
            <span>{reading}</span>
          </button>
        </Tooltip>
      </span>
      {open && createPortal(
        <div
          ref={panelRef}
          className="dsb-ctx-panel"
          style={position ?? { visibility: 'hidden', left: 0, top: 0 }}
          role="dialog"
          aria-label={t('ring.used')}
        >
          <div className="dsb-ctx-header">
            <span className="dsb-ctx-headline">{headBefore}</span>
            <span className="dsb-ctx-percent">{reading}</span>
            <span className="dsb-ctx-headline">{headAfter}</span>
            <span className="dsb-ctx-figures">
              {`~${formatTokens(context.usedTokens)} / ${formatTokens(context.contextWindow)}`}
            </span>
          </div>
          <div className="dsb-ctx-bar">
            {segments.map(segment => (
              <div
                key={segment.key}
                className={segment.color === undefined
                  ? 'dsb-ctx-segment'
                  : `dsb-ctx-segment ${segment.color}`}
                style={{ width: `${segment.width}%` }}
              />
            ))}
          </div>
          {breakdown !== undefined && (
            <dl className="dsb-ctx-rows">
              {ROWS.map(row => (
                <div className="dsb-ctx-row" key={row.key}>
                  <dt>
                    <span className={`dsb-ctx-swatch ${row.color}`} aria-hidden />
                    {t(row.label)}
                  </dt>
                  <dd>{`~${formatTokens(breakdown[row.key])}`}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>,
        document.body,
      )}
    </>
  )
}
