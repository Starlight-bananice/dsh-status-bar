/**
 * Host-side Chinese holiday-calendar source for the client's peak/off-peak
 * pricing: DeepSeek bills peak rates only on working days (Mon–Fri minus
 * Chinese public holidays), while weekends, statutory holidays AND 调休
 * (adjusted rest days) are off-peak all day. Those dates are re-announced by
 * the State Council every year, so the client cannot hard-code them.
 *
 * The host fetches the published calendar (holiday-cn, which transcribes the
 * State Council notices), caches it on disk under the plugin's data directory,
 * and serves it to the browser half over the plugin's own HTTP route — the
 * renderer never talks to a third party directly.
 *
 * @module @bananiceee/dsh-status-bar/holiday-source
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { ledgerDataDir } from "./usage-ledger.js";
const CACHE_FILENAME = 'holidays.json';
/** Re-check a cached year after this long — notices land in Nov/Dec. */
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 12_000;
/** Public data source (jsDelivr CDN mirror of the holiday-cn dataset). */
export const HOLIDAY_CDN_BASE = 'https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master';
/** DeepSeek's schedule is defined in Beijing time; the calendar is its calendar. */
export const HOLIDAY_TIMEZONE = 'Asia/Shanghai';
/** `YYYY-MM-DD` and the year in Beijing time. */
function todayInShanghai(at = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: HOLIDAY_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(at);
    return { date: parts, year: Number(parts.slice(0, 4)) };
}
/** The plugin's local data directory (same root as the usage ledger). */
export function holidayCacheFile(dshHome) {
    return join(ledgerDataDir(dshHome), CACHE_FILENAME);
}
async function readCache(file) {
    try {
        const parsed = JSON.parse(await readFile(file, 'utf8'));
        if (parsed === null || typeof parsed !== 'object' || parsed.years === undefined) {
            return { version: 1, years: {} };
        }
        return { version: 1, years: parsed.years ?? {} };
    }
    catch {
        return { version: 1, years: {} };
    }
}
/** Write through a temp file + rename so a crash never truncates the cache. */
async function writeCache(file, cache) {
    try {
        await mkdir(dirname(file), { recursive: true });
        const tmp = `${file}.tmp`;
        await writeFile(tmp, JSON.stringify(cache, null, 2), 'utf8');
        await rename(tmp, file);
    }
    catch {
        // A read-only or missing data dir must not break pricing: the in-memory
        // copy still answers this session.
    }
}
/** Validate one published day record. */
function parseDay(raw) {
    if (raw === null || typeof raw !== 'object')
        return null;
    const record = raw;
    const date = record.date;
    const isOffDay = record.isOffDay;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))
        return null;
    if (typeof isOffDay !== 'boolean')
        return null;
    return { date, name: typeof record.name === 'string' ? record.name : '', isOffDay };
}
async function fetchYear(year) {
    const response = await fetch(`${HOLIDAY_CDN_BASE}/${year}.json`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { accept: 'application/json' },
    });
    if (!response.ok)
        throw new Error(`HTTP ${response.status}`);
    const parsed = JSON.parse(await response.text());
    const rawDays = parsed.days;
    if (!Array.isArray(rawDays))
        throw new Error('malformed payload');
    const days = rawDays.map(parseDay).filter((day) => day !== null);
    if (days.length === 0)
        throw new Error('empty calendar');
    const papers = Array.isArray(parsed.papers)
        ? parsed.papers.filter((paper) => typeof paper === 'string')
        : [];
    return { papers, days };
}
/**
 * Calendars for the requested years, newest-first refetch on `refresh`.
 * A failed refresh falls back to whatever is cached for that year; a year that
 * has never been fetched and cannot be reached is reported in `errors`.
 */
export async function loadHolidayCalendars(years, refresh, dshHome, now = new Date()) {
    const file = holidayCacheFile(dshHome);
    const cache = await readCache(file);
    const today = todayInShanghai(now);
    const results = [];
    const errors = [];
    let dirty = false;
    for (const year of [...new Set(years)].sort((a, b) => b - a)) {
        const cached = cache.years[String(year)];
        const fresh = cached !== undefined && now.getTime() - cached.fetchedAt < CACHE_TTL_MS;
        if (cached !== undefined && fresh && !refresh) {
            results.push({
                calendar: { year, papers: cached.papers, days: cached.days },
                source: 'cache',
                fetchedAt: cached.fetchedAt,
            });
            continue;
        }
        try {
            const fetched = await fetchYear(year);
            const fetchedAt = now.getTime();
            cache.years[String(year)] = { fetchedAt, papers: fetched.papers, days: fetched.days };
            dirty = true;
            results.push({
                calendar: { year, papers: fetched.papers, days: fetched.days },
                source: 'network',
                fetchedAt,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (cached !== undefined) {
                results.push({
                    calendar: { year, papers: cached.papers, days: cached.days },
                    source: 'cache',
                    fetchedAt: cached.fetchedAt,
                    warning: message,
                });
            }
            else {
                errors.push({ year, message });
            }
        }
    }
    if (dirty)
        await writeCache(file, cache);
    return { years: results, errors, today: today.date };
}
/**
 * Route handler payload: every year whose rules can still apply right now —
 * last year (a fetch happening in early January must know about the previous
 * year's 调休), the current year, and next year.
 */
export async function holidayApiPayload(requested, refresh, dshHome, now = new Date()) {
    const current = todayInShanghai(now).year;
    const years = requested === null
        ? [current, current - 1, current + 1]
        : [requested];
    const loaded = await loadHolidayCalendars(years, refresh, dshHome, now);
    return { ...loaded, requested: requested ?? current, source: HOLIDAY_CDN_BASE };
}
//# sourceMappingURL=holiday-source.js.map