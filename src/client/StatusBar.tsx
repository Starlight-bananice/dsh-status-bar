/**
 * The status bar itself: a composer-dock entry that shadows the shipped
 * `stats` cell (id 'stats', lower priority) and renders the configurable
 * segment line. Unloading the plugin restores the built-in stats line.
 *
 * Layout mirrors the shipped row: block, centered, 12/20 tertiary text, with
 * the ellipsis + delayed hover tooltip as the narrow-column fallback. With
 * `wrap` enabled the bar becomes a flex-wrap line that never truncates.
 */

import { Fragment, memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { JobView, SessionSummary } from '@deepseek-ai/dsh-client-runtime/client'
import { useStatusBarConfig } from './config.ts'
import { buildSegments, deriveWindowStats, type SegmentView } from './segments.ts'
import { NS } from './locales.ts'
import './projections.ts'

/** Full props for the composer-dock entry (owner InputZone + standard kit + locale). */
export type StatusBarDockEntryProps =
  PropsRuntime<'conversation.composer.dock'> & PropsLocale<typeof NS>

const STATUS_DOT: Record<'running' | 'idle' | 'error', string> = {
  running: '#e8b339',
  idle: '#5b8def',
  error: '#e5484d',
}

/** Compact dot for the status segment (kept dependency-light). */
function StatusDot({ state }: { state: 'running' | 'idle' | 'error' }) {
  return (
    <span
      className="dsb-dot"
      style={{ backgroundColor: STATUS_DOT[state] }}
      aria-hidden
    />
  )
}

/**
 * Trailing-edge throttle for the live TPS figure. The host emits a
 * `liveTokenUsage` projection update on every stream chunk — potentially
 * many times per second — so the bar would otherwise re-render the segment
 * at stream rate. This keeps the displayed value at most one refresh per
 * `intervalMs` while always converging to the latest measurement: a fresh
 * value arriving after a quiet interval shows immediately, otherwise the
 * newest value lands when the interval elapses.
 */
function useThrottled<T>(value: T, intervalMs: number): T {
  const [display, setDisplay] = useState(value)
  const latest = useRef(value)
  latest.current = value
  const lastAt = useRef(0)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (latest.current === display) return
    const now = Date.now()
    const since = now - lastAt.current
    if (since >= intervalMs) {
      lastAt.current = now
      setDisplay(latest.current)
      return
    }
    if (timer.current !== undefined) return
    timer.current = window.setTimeout(() => {
      timer.current = undefined
      lastAt.current = Date.now()
      setDisplay(latest.current)
    }, intervalMs - since)
  })

  useEffect(() => () => {
    if (timer.current !== undefined) window.clearTimeout(timer.current)
  }, [])

  return display
}

/** One segment: optional state dot + text (the row owns separators). */
function Segment({ view }: { view: SegmentView }) {
  return (
    <span className="dsb-seg">
      {view.state !== undefined && <StatusDot state={view.state} />}
      {view.text}
    </span>
  )
}

export const StatusBarDockEntry = memo(function StatusBarDockEntry(props: StatusBarDockEntryProps) {
  const config = useStatusBarConfig()
  const { session, useProjection, useSessions, sessionId, t } = props

  // Whole-log stats ride the durable projection; assemblies without the unit
  // fall back to the window fold (same field names, same display).
  const projected = useProjection('sessionStats')
  const usage = useProjection('tokenUsage')
  const pressure = useProjection('contextPressure')
  // The live rate is emitted once per stream chunk; throttle the displayed
  // figure to at most one refresh per 500ms.
  const liveRate = useThrottled(useProjection('liveTokenUsage')?.tokensPerSecond, 500)
  const sessionModelValue = useProjection('sessionModel')
  const sessionModel = sessionModelValue !== undefined && sessionModelValue.model !== null
    ? { provider: sessionModelValue.provider ?? 'unknown', model: sessionModelValue.model }
    : undefined
  const jobs: readonly JobView[] | undefined = useSessions(
    state => state.jobsBySession[sessionId],
  )
  const summary: SessionSummary | undefined = useSessions(state => state.byId[sessionId])

  // The sessionTime segment ticks once per second while the session runs.
  const [now, setNow] = useState(() => Date.now())
  const wantsClock = config.enabled && config.segments.includes('sessionTime')
  useEffect(() => {
    if (!wantsClock || !session.running) return
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [wantsClock, session.running])

  // Single-line mode watches for ellipsis truncation to arm the hover tooltip.
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [truncated, setTruncated] = useState(false)

  const stats = projected ?? deriveWindowStats(session)
  const views = config.enabled
    ? buildSegments({ session, stats, usage, pressure, liveRate, sessionModel, jobs, summary, now }, config, t)
    : []
  const line = views.map(view => view.text).join(' | ')

  useLayoutEffect(() => {
    const el = rootRef.current
    if (el === null) return
    const measure = () => { setTruncated(el.scrollWidth > el.clientWidth) }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => { observer.disconnect() }
  }, [line, config.wrap, config.enabled])

  if (!config.enabled || views.length === 0) return null

  if (config.wrap) {
    return (
      <div ref={rootRef} className="dsb-bar dsb-wrap">
        {views.map((view, i) => (
          <Fragment key={view.id}>
            <Segment view={view} />
            {i < views.length - 1 && <span className="dsb-sep" aria-hidden>|</span>}
          </Fragment>
        ))}
      </div>
    )
  }
  return (
    <Tooltip label={line} side="top" delayMs={500} disabled={!truncated}>
      <div ref={rootRef} className="dsb-bar">
        {views.map((view, i) => (
          <Fragment key={view.id}>
            {i > 0 && <span className="dsb-sep" aria-hidden>|</span>}
            <Segment view={view} />
          </Fragment>
        ))}
      </div>
    </Tooltip>
  )
})
