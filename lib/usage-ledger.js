/**
 * Host-side usage ledger: subscribes the global `session/event` feed, folds
 * every assistant-message's provider-reported token usage into hourly
 * buckets keyed by model, and persists the stream to a JSONL file inside
 * the plugin's local data directory so the chart survives restarts.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
/** How long the in-memory ledger keeps history (rolling window). */
const RETENTION_MS = 120 * 24 * 60 * 60 * 1_000;
/** Hour bucket key: local 'YYYY-MM-DDTHH'. */
function hourKey(time) {
    const d = new Date(time);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}`;
}
function emptyUsage() {
    return { input: 0, cacheRead: 0, cacheWrite: 0, output: 0 };
}
function addUsage(target, u) {
    target.input += u.input;
    target.cacheRead += u.cacheRead;
    target.cacheWrite += u.cacheWrite;
    target.output += u.output;
}
export class UsageLedger {
    /** hourKey → model → usage. */
    hourly = new Map();
    file;
    constructor(dataDir) {
        this.file = join(dataDir, 'usage.jsonl');
        mkdirSync(dataDir, { recursive: true });
        this.load();
    }
    load() {
        if (!existsSync(this.file))
            return;
        try {
            const cutoff = Date.now() - RETENTION_MS;
            let lineCount = 0;
            let stale = 0;
            for (const line of readFileSync(this.file, 'utf8').split('\n')) {
                if (line.trim().length === 0)
                    continue;
                lineCount += 1;
                let record;
                try {
                    record = JSON.parse(line);
                }
                catch {
                    continue;
                }
                if (record.t < cutoff) {
                    stale += 1;
                    continue;
                }
                this.ingest(record);
            }
            // Rewrite the file when the stale tail is significant (keeps the
            // durable file bounded without per-event rewriting).
            if (stale > 0 && stale > lineCount / 4)
                this.rewriteFile();
        }
        catch {
            // A corrupt/unreadable ledger must never block plugin startup.
        }
    }
    rewriteFile() {
        const lines = [];
        const cutoff = Date.now() - RETENTION_MS;
        for (const [key, models] of this.hourly) {
            const time = Number(new Date(`${key.replace('T', 'T')}:00`));
            if (Number.isNaN(time) || time < cutoff)
                continue;
            for (const [model, usage] of models) {
                lines.push(JSON.stringify({ t: time, model, ...usage }));
            }
        }
        try {
            writeFileSync(this.file, lines.join('\n') + (lines.length > 0 ? '\n' : ''), 'utf8');
        }
        catch {
            // best-effort compaction
        }
    }
    /** One assistant message's usage into the ledger (in-memory + append). */
    record(event) {
        if (event.type !== 'assistant/message')
            return;
        const usage = event.data.usage;
        if (usage === undefined)
            return;
        const source = event.data.message.source;
        if (source.kind !== 'model')
            return;
        const record = {
            t: event.time,
            model: source.model,
            input: usage.inputTokens,
            cacheRead: usage.cacheReadTokens ?? 0,
            cacheWrite: usage.cacheWriteTokens ?? 0,
            output: usage.outputTokens,
        };
        this.ingest(record);
        try {
            appendFileSync(this.file, `${JSON.stringify(record)}\n`, 'utf8');
        }
        catch {
            // persistence failure must not break the session feed
        }
    }
    ingest(record) {
        const key = hourKey(record.t);
        let models = this.hourly.get(key);
        if (models === undefined) {
            models = new Map();
            this.hourly.set(key, models);
        }
        const usage = models.get(record.model) ?? emptyUsage();
        addUsage(usage, record);
        models.set(record.model, usage);
        // Rolling cleanup (amortized: a few maps per new hour).
        if (this.hourly.size > 24 * 130) {
            const cutoff = Date.now() - RETENTION_MS;
            for (const [key2, models2] of this.hourly) {
                if (Date.now() - Number(new Date(`${key2}T00:00`)) < cutoff)
                    continue;
                if (models2.size === 0)
                    this.hourly.delete(key2);
            }
        }
    }
    /**
     * Query one period's buckets. `offset` 0 = current period, 1 = previous,
     * etc. Buckets are produced in chronological order with a stable key
     * (day: 'HH:00'; week/month: 'MM-DD').
     */
    query(period, offset, now = Date.now()) {
        const start = periodStartWithOffset(period, offset, now);
        const count = period === 'day' ? 24 : period === 'week' ? 7 : daysInMonth(new Date(start));
        const bucketMs = period === 'day' ? 3_600_000 : 24 * 3_600_000;
        const buckets = [];
        for (let i = 0; i < count; i += 1) {
            const bucketTime = start + i * bucketMs;
            const key = period === 'day'
                ? `${String(new Date(bucketTime).getHours()).padStart(2, '0')}:00`
                : `${String(new Date(bucketTime).getMonth() + 1).padStart(2, '0')}-${String(new Date(bucketTime).getDate()).padStart(2, '0')}`;
            const models = new Map();
            if (period === 'day') {
                const hourMap = this.hourly.get(hourKey(bucketTime));
                if (hourMap !== undefined) {
                    for (const [model, usage] of hourMap)
                        models.set(model, { ...usage });
                }
            }
            else {
                // Fold the 24 hourly buckets of each day.
                for (let h = 0; h < 24; h += 1) {
                    const hourMap = this.hourly.get(hourKey(bucketTime + h * 3_600_000));
                    if (hourMap === undefined)
                        continue;
                    for (const [model, usage] of hourMap) {
                        const target = models.get(model) ?? emptyUsage();
                        addUsage(target, usage);
                        models.set(model, target);
                    }
                }
            }
            buckets.push({ key, usage: Object.fromEntries(models) });
        }
        return { start, end: start + count * bucketMs, buckets };
    }
}
/** Start of the current period in local time. */
export function periodStart(period, now = Date.now()) {
    const d = new Date(now);
    d.setMinutes(0, 0, 0);
    if (period === 'day') {
        // Day buckets run from 00:00 — clearing only minutes would keep the
        // current hour, shifting the first column away from 00:00.
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }
    if (period === 'week') {
        // Monday 00:00 of the current week.
        const mondayOffset = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - mondayOffset);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }
    // Month: the 1st, 00:00.
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}
/**
 * Start of the period `offset` periods before the current one. Day/week
 * step by fixed milliseconds; month steps calendar months (a month is not a
 * fixed duration, so plain arithmetic would be wrong).
 */
export function periodStartWithOffset(period, offset, now = Date.now()) {
    const start = periodStart(period, now);
    if (offset <= 0)
        return start;
    if (period === 'month') {
        const d = new Date(start);
        d.setMonth(d.getMonth() - offset);
        return d.getTime();
    }
    return start - offset * (period === 'day' ? 24 * 3_600_000 : 7 * 24 * 3_600_000);
}
function daysInMonth(monthStart) {
    return new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
}
/** Plugin data directory: <dsh home>/dsh-status-bar. */
export function ledgerDataDir(envHome) {
    const home = envHome && envHome.trim().length > 0 ? envHome : join(homedir(), '.dsh');
    return join(home, 'dsh-status-bar');
}
//# sourceMappingURL=usage-ledger.js.map