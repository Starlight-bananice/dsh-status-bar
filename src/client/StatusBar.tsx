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

import { Fragment, memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client'
import type { JobView } from '@deepseek-ai/dsh-jobs/view'
import type { IJobs } from '@deepseek-ai/dsh-api-job-controller/client'
import type { LiveRateSource } from './live-rate.ts'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { useStatusBarConfig } from './config.ts'
import { noteCurrentModel } from './live-model.ts'
import { buildSegments, deriveWindowStats, type SegmentView } from './segments.ts'
import { NS } from './locales.ts'
import './projections.ts'

/**
 * Business face the bar's registration hands to the component: the client
 * jobs roster observable (synthesized into a `useJobs` selector hook) and the
 * reference-counted roster watcher. Both come from the `jobs` client service,
 * the same source the shipped header job list uses.
 */
export interface StatusBarInjected {
  hooks: {
    /** Live job rosters keyed by session id. */
    jobs: IJobs['state']
    /** Live generation rate of the current stream, folded from the session event window. */
    liveRate: LiveRateSource
  }
  /** Keep one session's roster current; returns the stop function. */
  watchRows: (sessionId: SessionId) => () => void
  /** Follow one session's event window for the live TPS figure; returns the stop function. */
  watchLiveRate: (sessionId: SessionId) => () => void
}

/** Full props for the composer-dock entry (owner InputZone + standard kit + locale + jobs face). */
export type StatusBarDockEntryProps =
  PropsRuntime<'conversation.composer.dock'> & PropsLocale<typeof NS> & InjectFace<StatusBarInjected>

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
 * Trailing-edge throttle for the live TPS figure. The client-side live-rate
 * fold publishes on every stream chunk — potentially many times per second —
 * so the bar would otherwise re-render the segment at stream rate. This keeps
 * the displayed value at most one refresh per `intervalMs` while always
 * converging to the latest measurement: a fresh value arriving after a quiet
 * interval shows immediately, otherwise the newest value lands when the
 * interval elapses.
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
  const {
    useChat, useInput, useJobs, useLiveRate, useProjection, useSession, useSessions,
    sessionId, t, watchLiveRate, watchRows,
  } = props

  // Whole-log stats ride the durable projection; assemblies without the unit
  // fall back to the window fold (same field names, same display).
  const projected = useProjection('sessionStats')
  const usage = useProjection('tokenUsage')
  const pressure = useProjection('contextPressure')
  // The live rate is folded client-side from the session's event window and
  // re-published once per stream chunk; throttle the displayed figure to at
  // most one refresh per 500ms. Undefined (no active stream) falls through to
  // the window's average decode rate in the segment fold.
  const liveRate = useThrottled(useLiveRate(view => view.tokensPerSecond), 500)
  useEffect(() => watchLiveRate(sessionId), [sessionId, watchLiveRate])
  const sessionModelValue = useProjection('sessionModel')
  const sessionModel = sessionModelValue !== undefined && sessionModelValue.model !== null
    ? { provider: sessionModelValue.provider ?? 'unknown', model: sessionModelValue.model }
    : undefined
  const sessionUsage = useProjection('sessionUsage')
  // Session lifecycle facts and the settled Chat slice: 0.2.0 splits what the
  // old ConversationSnapshot carried — `useSession` owns running/lastAgentError,
  // the Chat target owns nodes/timings/partial, and the composer inbox owns the
  // queue. The job roster comes from the `jobs` client service (same source as
  // the shipped header job list), kept current by a reference-counted watcher.
  const session = { running: useSession(state => state.running), lastAgentError: useSession(state => state.lastAgentError) }
  const chat = useChat(state => state.legacy)
  const queueLength = useInput(state => state.queue.length)
  const jobs: readonly JobView[] | undefined = useJobs(state => state.rows[sessionId])
  const summary: SessionSummary | undefined = useSessions(state => state.byId[sessionId])

  useEffect(() => watchRows(sessionId), [sessionId, watchRows])

  // Publish the model in view for root-scoped surfaces (the Settings price
  // book has no session scope of its own in 0.2.0).
  const currentModelName = sessionModel?.model
  useEffect(() => { noteCurrentModel(currentModelName) }, [currentModelName])

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

  const stats = projected ?? deriveWindowStats(chat)
  const views = config.enabled
    ? buildSegments({ chat, session, queueLength, stats, usage, pressure, liveRate, sessionModel, sessionUsage, jobs, summary, now }, config, t)
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
