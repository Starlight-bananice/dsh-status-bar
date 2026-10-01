/**
 * Holiday-calendar store for the peak/off-peak pricing.
 *
 * The published Chinese holiday / 调休 calendar changes every year, so the
 * client never hard-codes it: it asks this plugin's own host route
 * (`/status-bar/api/holidays`, which fetches + caches the dataset on disk),
 * keeps the answer in localStorage so the cost segment prices correctly on the
 * first paint, and exposes a `useSyncExternalStore` hook. A failed fetch never
 * throws into render — it degrades to the weekday rule and surfaces a message
 * in the settings page.
 */

import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { HolidayCalendar, HolidayOverride, ModelConfig } from './pricing-types.ts'
import { holidayIndex, resolveBilling, type BillingState, type HolidayIndex } from './timezone.ts'

export const HOLIDAY_CACHE_KEY = 'dsh.statusBar.holidays.v1'
const API_PATH = '/status-bar/api/holidays'
/** Re-ask the host after this long; the host itself re-checks the dataset. */
const CLIENT_TTL_MS = 12 * 60 * 60 * 1000

export interface StoredCalendars {
  fetchedAt: number
  years: HolidayCalendar[]
}

export interface HolidayStatus {
  /** True while a host request is in flight. */
  loading: boolean
  /** Last failure or fallback message, cleared by the next clean fetch. */
  error: string | null
  /** Provenance of the last successful fetch (dataset URL). */
  source: string | null
  fetchedAt: number | null
}

export interface HolidaySnapshot {
  calendars: HolidayCalendar[]
  status: HolidayStatus
}

interface HostPayload {
  years?: { calendar?: HolidayCalendar; warning?: string }[]
  errors?: { year: number; message: string }[]
  source?: string
}

function readStorage(): StoredCalendars | null {
  try {
    const raw = window.localStorage.getItem(HOLIDAY_CACHE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw) as Partial<StoredCalendars>
    if (!Array.isArray(parsed.years)) return null
    const years = parsed.years.filter(year =>
      year !== null && typeof year === 'object' && Array.isArray(year.days))
    return { fetchedAt: typeof parsed.fetchedAt === 'number' ? parsed.fetchedAt : 0, years }
  } catch {
    return null
  }
}

function writeStorage(value: StoredCalendars): void {
  try {
    window.localStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify(value))
  } catch {
    // storage unavailable: the in-memory copy still serves this session
  }
}

class HolidayStore {
  private snapshot: HolidaySnapshot
  private inflight: Promise<void> | null = null
  private readonly listeners = new Set<() => void>()

  constructor() {
    const stored = readStorage()
    this.snapshot = {
      calendars: stored?.years ?? [],
      status: {
        loading: false,
        error: null,
        source: null,
        fetchedAt: stored !== null && stored.fetchedAt > 0 ? stored.fetchedAt : null,
      },
    }
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  getSnapshot = (): HolidaySnapshot => this.snapshot

  /** Fetch from the plugin host; concurrent callers share one request. */
  async load(refresh = false): Promise<void> {
    if (this.inflight !== null) return this.inflight
    const request = this.run(refresh)
    this.inflight = request
    try {
      await request
    } finally {
      this.inflight = null
    }
  }

  /** Fetch when the cached copy is stale (never rejects). */
  async loadIfStale(): Promise<void> {
    const fetchedAt = this.snapshot.status.fetchedAt
    if (fetchedAt !== null && Date.now() - fetchedAt < CLIENT_TTL_MS) return
    await this.load()
  }

  private async run(refresh: boolean): Promise<void> {
    this.setSnapshot({ ...this.snapshot.status, loading: true, error: null })
    try {
      const response = await fetch(refresh ? `${API_PATH}?refresh=1` : API_PATH, {
        headers: { accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = await response.json() as HostPayload
      const years = payload.years ?? []
      const calendars = years
        .map(year => year.calendar)
        .filter((calendar): calendar is HolidayCalendar =>
          calendar !== undefined && Array.isArray(calendar.days))
        .sort((a, b) => a.year - b.year)
      if (calendars.length === 0) {
        const failed = (payload.errors ?? []).map(item => `${item.year}: ${item.message}`).join('; ')
        throw new Error(failed === '' ? 'empty-calendar' : failed)
      }
      const fetchedAt = Date.now()
      const warnings = [
        ...years
          .map(year => year.warning)
          .filter((warning): warning is string => typeof warning === 'string' && warning !== ''),
        // Years the host could not publish at all (e.g. next year's notice is
        // not out yet) are informational, never fatal: the current year's
        // rules still apply.
        ...(payload.errors ?? []).map(item => `${item.year}: ${item.message}`),
      ]
      this.snapshot = {
        calendars,
        status: {
          loading: false,
          error: warnings.length > 0 ? warnings.join('; ') : null,
          source: payload.source ?? null,
          fetchedAt,
        },
      }
      writeStorage({ fetchedAt, years: calendars })
    } catch (error) {
      this.setSnapshot({
        ...this.snapshot.status,
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
    this.emit()
  }

  private setSnapshot(status: HolidayStatus): void {
    this.snapshot = { ...this.snapshot, status }
    this.emit()
  }

  private emit(): void {
    for (const listener of this.listeners) listener()
  }
}

export const holidayStore = new HolidayStore()

/** Non-reactive read for pure code paths (segment/cost folds outside render). */
export function currentCalendars(): readonly HolidayCalendar[] {
  return holidayStore.getSnapshot().calendars
}

/** Reactive calendar state (settings page). */
export function useHolidayCalendars(): HolidaySnapshot {
  return useSyncExternalStore(holidayStore.subscribe, holidayStore.getSnapshot, holidayStore.getSnapshot)
}

/**
 * One store read for a whole panel: the merged lookup AND the calendars it was
 * built from, both from the same snapshot. Splitting them across two hooks lets
 * a panel describe one calendar while pricing off another (that is how the
 * 7-day strip once disagreed with the tier badge mid-fetch).
 */
export interface HolidayView {
  index: HolidayIndex
  calendars: HolidayCalendar[]
  status: HolidayStatus
}

/** Merged lookup over the live calendars plus the persisted manual overrides. */
export function useHolidayView(overrides: readonly HolidayOverride[]): HolidayView {
  const snapshot = useSyncExternalStore(
    holidayStore.subscribe,
    holidayStore.getSnapshot,
    holidayStore.getSnapshot,
  )
  const { calendars, status } = snapshot
  const index = useMemo(() => holidayIndex(calendars, overrides), [calendars, overrides])
  return { index, calendars, status }
}

/**
 * Billing state of one model at `at`, over the merged lookup. Re-renders
 * whenever the calendar or the overrides change, so a live tier badge stays
 * honest while the settings page is open.
 */
export function useBillingState(
  config: ModelConfig,
  index: HolidayIndex,
  at: number,
): BillingState {
  const { calendars } = useHolidayCalendars()
  return useMemo(() => resolveBilling(config, index, at), [config, index, at, calendars])
}

/** Fetch the calendar once on mount when the cached copy is stale. */
export function useHolidayAutoFetch(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    void holidayStore.loadIfStale()
  }, [enabled])
}
