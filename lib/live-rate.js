/**
 * `liveTokenUsage` projection unit: the real-time generation rate of the
 * session's CURRENT stream, served to the bar over the session-projection
 * channel — DSH's live-state path from host to browser.
 *
 * The unit folds `assistant/chunk` events as they commit: each output delta
 * (text / reasoning / tool-call) contributes an estimated token count and
 * refreshes the measurement window, so the change feed fires once per chunk
 * and the client's `useProjection('liveTokenUsage')` re-renders the TPS
 * segment while the stream is hot (the bar throttles the displayed figure to
 * at most two refreshes per second). When the provider reports a `usage`
 * chunk mid-stream the estimate is replaced by the exact `outputTokens`, and
 * the rate is then provider-accurate.
 *
 * Output estimation is block-aware (approach learned from `dsh-live-stats`
 * in the dsh-web-ui family): per-block character accumulation priced as
 * `ceil(chars / charsPerToken)` plus a per-block framing overhead, tool
 * calls priced from name + argument characters separately, one role overhead
 * per stream once any block is priced, and a `block-end` chunk re-prices its
 * slot from the full assembled block (so a fragmented delta stream never
 * inflates the figure and non-text blocks — image, tool-result — are priced
 * from their bounded JSON). A single-character stream still measures: the
 * first delta of a block always crosses the framing overhead.
 *
 * Rate semantics: tokens accumulated since the stream's first output token
 * divided by that span (a running average, not an instant sample), rounded to
 * one decimal. Once a stream settles (`assistant/message`, `step/end`, or
 * `turn/end`) the active window is dropped and the rate reports **0** — no
 * active stream means no generation, so the bar's TPS segment falls to zero
 * the moment the agent stops producing instead of freezing on a stale value.
 *
 * Two hazards are folded explicitly:
 *
 * - The agent loop retries a failed stream under the SAME (turn, step) with
 *   no boundary event in between, so the log's `llm/retry` marker
 *   (plugin-merged, structurally matched) resets the measurement window —
 *   without it every retry attempt's tokens would keep accumulating into one
 *   window and the rate would climb while the agent is stuck retrying.
 *
 * - The estimator's own clock: providers flush deltas in bursts (tool-call
 *   JSON arguments arrive with dt≈0–2 ms, and the persistence layer can
 *   batch-flush), so a plain running average over the window span climbs
 *   without bound during a burst — tokens keep accruing while
 *   `latest - first` stays frozen. The estimated branch therefore uses an
 *   EWMA over per-chunk INSTANT rates with a minimum inter-chunk interval
 *   (burst deltas are treated as spaced at MIN_DT_MS), which bounds the
 *   displayed figure to the real generation envelope; the exact branch
 *   (provider-reported usage) keeps the window average, which is faithful
 *   there, with a minimum span floor.
 *
 * The fold is pure over the durable log (event `time` is the only clock), so
 * replay, restore, and the persisted projection cache all reproduce the same
 * values — no wall clock enters the state.
 *
 * @module @Starlight-bananice/dsh-status-bar/live-rate
 */
import { z } from 'zod';
/** Approximate text characters represented by one token (dsh-live-stats default). */
export const CHARS_PER_TOKEN = 4;
/** Fixed framing tokens charged per content block (structure the tokenizer prices). */
export const BLOCK_OVERHEAD = 4;
/** Fixed framing tokens charged once per stream once any block is priced (role framing). */
export const ROLE_OVERHEAD = 4;
/**
 * Minimum inter-chunk interval for the estimated branch's instant rate.
 * Providers flush bursts (tool-call arguments, batched deltas) with dt≈0,
 * so a raw dt would report absurd rates; burst deltas are treated as spaced
 * at this floor instead. 20 ms bounds a burst to the real generation
 * envelope (measured: ≤ ~360 tok/s on real sessions) while genuine
 * high-speed streaming still reads through.
 */
export const MIN_DT_MS = 20;
/** Minimum window span for the exact (provider-reported) branch's average. */
export const MIN_SPAN_MS = 250;
/**
 * EWMA weight of the newest instant rate (0..1); higher = more responsive.
 * 0.6 keeps the figure snappy (≈2 chunks to a 90% step) while the instant
 * rate's dt floor still damps burst noise.
 */
export const EWMA_ALPHA = 0.6;
// 0 is a legitimate view value: the fold reports 0 once a stream settles
// (no active generation) and the bar must show that. positive() would reject
// exactly the settled snapshot the history path validates, failing every
// history read of an idle session with a zod too_small error.
const liveTokenUsageSchema = z.object({
    tokensPerSecond: z.number().nonnegative().optional(),
}).strict();
/** The current stream is the one tracked by the fold state. */
function isTracked(state, turn, step) {
    return state.turn === turn && state.step === step;
}
/** Provider-reported output tokens, guarded the way the stats fold guards node usage. */
function usageOutputTokens(usage) {
    if (usage === undefined)
        return null;
    const value = usage.outputTokens;
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}
/**
 * Instant rate of one counted delta: `added` tokens over the inter-chunk
 * interval, floored at MIN_DT_MS so burst-flushed deltas (dt≈0) cannot
 * report absurd figures. The window's first chunk has no predecessor, so it
 * is treated as spaced at the floor too.
 */
function instantRateOf(addedTokens, prevTime, nowTime) {
    const dt = prevTime === null ? MIN_DT_MS : Math.max(nowTime - prevTime, MIN_DT_MS);
    return Math.round(addedTokens * 1_000 / dt * 10) / 10;
}
/** Exponential smoothing of the instant rate; a null carried rate adopts the first sample. */
function ewmaRate(carried, instant) {
    if (carried === null)
        return instant;
    return Math.round((carried * (1 - EWMA_ALPHA) + instant * EWMA_ALPHA) * 10) / 10;
}
/**
 * Window average for the exact branch (provider-reported usage): faithful
 * there because both tokens and span are real, with a span floor so a
 * burst-then-settle stream still lands on a sane figure.
 */
function spanRateOf(outputTokens, firstTime, nowTime) {
    const span = Math.max(nowTime - firstTime, MIN_SPAN_MS);
    return Math.round(outputTokens * 1_000 / span * 10) / 10;
}
/** The idle state every settle lands on (window dropped, rate reported as 0). */
function settled(state) {
    return {
        turn: null,
        step: null,
        firstOutputTime: null,
        latestOutputTime: null,
        prevOutputTime: null,
        outputTokens: 0,
        estimated: false,
        tokensPerSecond: 0,
        blocks: [],
        pricedTokens: 0,
        pricedBlocks: 0,
        exact: false,
    };
}
/**
 * Price one assembled block the way the estimator prices streamed deltas:
 * text-like blocks and tool calls by accumulated characters plus framing,
 * tool-result content recursively (depth-capped), everything else from its
 * bounded JSON snapshot. This is what a `block-end` chunk installs — the
 * final figure supersedes the delta accumulation, so fragmented streams and
 * provider-merged blocks cannot drift the estimate.
 */
const MAX_UNKNOWN_BLOCK_CHARS = 4096;
const MAX_CONTENT_DEPTH = 128;
function estimateTextBlockTokens(characters) {
    return Math.ceil(characters / CHARS_PER_TOKEN) + BLOCK_OVERHEAD;
}
function estimateToolCallBlockTokens(nameCharacters, argumentCharacters) {
    return Math.ceil(nameCharacters / CHARS_PER_TOKEN)
        + Math.ceil(argumentCharacters / CHARS_PER_TOKEN)
        + BLOCK_OVERHEAD;
}
function estimateUnknownBlockTokens(block) {
    const serialized = JSON.stringify(block);
    const length = serialized.length > MAX_UNKNOWN_BLOCK_CHARS
        ? MAX_UNKNOWN_BLOCK_CHARS
        : serialized.length;
    return BLOCK_OVERHEAD + Math.ceil(length / CHARS_PER_TOKEN);
}
function estimateContentTokens(blocks, depth = 0) {
    let tokens = 0;
    for (const block of blocks) {
        switch (block.type) {
            case 'text':
            case 'reasoning':
                tokens += estimateTextBlockTokens(block.text.length);
                break;
            case 'tool-call':
                tokens += estimateToolCallBlockTokens(block.name.length, block.arguments.length);
                break;
            case 'tool-result':
                tokens += depth >= MAX_CONTENT_DEPTH
                    ? BLOCK_OVERHEAD
                    : estimateContentTokens(block.content, depth + 1) + BLOCK_OVERHEAD;
                break;
            default:
                tokens += estimateUnknownBlockTokens(block);
        }
    }
    return tokens;
}
/** Per-block estimate of one priced slot (what `write` diffs against). */
function blockEstimate(block) {
    switch (block.kind) {
        case 'text':
        case 'reasoning':
            return estimateTextBlockTokens(block.characters);
        case 'tool-call':
            return estimateToolCallBlockTokens(block.nameCharacters, block.argumentCharacters);
        case 'fixed':
            return block.tokens;
    }
}
/**
 * Incremental output pricing: apply one stream chunk to the block book and
 * return the MARGINAL token estimate it added. The first delta of a block
 * charges its framing overhead; later deltas charge only the character
 * growth crossing a `charsPerToken` boundary, so a fragmented delta stream
 * cannot inflate the figure. A `block-end` chunk replaces its slot with the
 * full-block estimate (the marginal can be negative when it corrects an
 * earlier over-estimate). Non-output chunks and empty deltas are no-ops and
 * return null — the fold then leaves the state untouched.
 */
function applyOutputChunk(book, chunk) {
    const write = (index, build) => {
        const previous = book.blocks[index] ?? undefined;
        const next = build(previous);
        const before = previous === undefined ? 0 : blockEstimate(previous);
        const after = blockEstimate(next);
        book.blocks[index] = next;
        book.pricedTokens += after - before;
        if (previous === undefined)
            book.pricedBlocks += 1;
        return after - before;
    };
    switch (chunk.type) {
        case 'text-delta':
            if (chunk.text === '')
                return null;
            return write(chunk.index, previous => ({
                kind: 'text',
                characters: (previous?.kind === 'text' ? previous.characters : 0) + chunk.text.length,
            }));
        case 'reasoning-delta':
            if (chunk.text === '')
                return null;
            return write(chunk.index, previous => ({
                kind: 'reasoning',
                characters: (previous?.kind === 'reasoning' ? previous.characters : 0) + chunk.text.length,
            }));
        case 'tool-call-delta':
            if (chunk.name === undefined && chunk.argumentsDelta === '')
                return null;
            return write(chunk.index, previous => ({
                kind: 'tool-call',
                nameCharacters: chunk.name?.length ?? (previous?.kind === 'tool-call' ? previous.nameCharacters : 0),
                argumentCharacters: (previous?.kind === 'tool-call' ? previous.argumentCharacters : 0)
                    + chunk.argumentsDelta.length,
            }));
        case 'block-end':
            return write(chunk.index, () => ({ kind: 'fixed', tokens: estimateContentTokens([chunk.block]) }));
        default:
            return null;
    }
}
/**
 * The `liveTokenUsage` unit registered on `ctx.sessionProjections` (exported
 * for the unit spec). Only `assistant/chunk` and the stream-closing events
 * change the state reference, so the change feed stays quiet otherwise.
 */
export const liveTokenUsageProjectionDefinition = {
    key: 'liveTokenUsage',
    schema: liveTokenUsageSchema,
    init: () => ({
        turn: null,
        step: null,
        firstOutputTime: null,
        latestOutputTime: null,
        prevOutputTime: null,
        outputTokens: 0,
        estimated: false,
        tokensPerSecond: null,
        blocks: [],
        pricedTokens: 0,
        pricedBlocks: 0,
        exact: false,
    }),
    apply: (state, event) => {
        // Plugin-merged log events (dsh-llm-retry's `llm/retry` marker) are not in
        // the static SessionEvent union, so match it structurally before the
        // switch narrows `event.type`. The retry marker is committed BEFORE the
        // NEXT attempt streams — same (turn, step), no step boundary in between.
        // Without a reset here every attempt's tokens would keep accumulating
        // into one window and the rate would climb while the agent is stuck
        // retrying; resetting restarts the window so only the current attempt
        // measures.
        if (event.type === 'llm/retry' && state.turn !== null) {
            const data = event.data;
            if (data?.turn === state.turn && data?.step === state.step) {
                // Window reset, but keep the measured rate across the short retry
                // wait (0.5 s+) — a fresh attempt is about to stream, so flashing 0
                // here would just flicker.
                return { ...settled(state), turn: state.turn, step: state.step, tokensPerSecond: state.tokensPerSecond };
            }
        }
        switch (event.type) {
            case 'assistant/chunk': {
                const { turn, step, chunk } = event.data;
                const fresh = !isTracked(state, turn, step);
                if (chunk.type === 'usage') {
                    const reported = usageOutputTokens(chunk.usage);
                    if (reported === null)
                        return state;
                    // Exact buckets supersede the estimate; the rate is the faithful
                    // window average (provider tokens over real elapsed time), floored
                    // by MIN_SPAN_MS against burst-then-settle streams.
                    const first = fresh || state.firstOutputTime === null ? event.time : state.firstOutputTime;
                    return {
                        ...state,
                        turn,
                        step,
                        firstOutputTime: first,
                        latestOutputTime: event.time,
                        prevOutputTime: event.time,
                        outputTokens: reported,
                        estimated: false,
                        exact: true,
                        blocks: [],
                        pricedTokens: 0,
                        pricedBlocks: 0,
                        tokensPerSecond: spanRateOf(reported, first, event.time),
                    };
                }
                // Once the provider reported exact usage for the CURRENT window,
                // further deltas neither add tokens nor extend the span — the exact
                // rate must not be diluted. A retry reset zeroes the window, so
                // exactness starts over with the next attempt.
                if (!fresh && state.exact)
                    return state;
                const book = {
                    blocks: [...state.blocks],
                    pricedTokens: state.pricedTokens,
                    pricedBlocks: state.pricedBlocks,
                };
                const added = applyOutputChunk(book, chunk);
                if (added === null)
                    return state;
                // Role framing: one fixed overhead per response once any block is
                // priced, mirroring the tokenizer's per-message structure charge.
                const outputTokens = book.pricedBlocks === 0 ? 0 : book.pricedTokens + ROLE_OVERHEAD;
                // The window starts at the first counted chunk of the current
                // attempt; a retry reset clears firstOutputTime, so the next chunk
                // re-anchors.
                const firstOutputTime = state.firstOutputTime === null ? event.time : state.firstOutputTime;
                if (added <= 0) {
                    // A block-end reprice corrected the total without adding tokens:
                    // keep the rate and the measurement clock exactly where they are.
                    return {
                        ...state,
                        turn,
                        step,
                        blocks: book.blocks,
                        pricedTokens: book.pricedTokens,
                        pricedBlocks: book.pricedBlocks,
                        firstOutputTime,
                        outputTokens,
                        estimated: true,
                    };
                }
                return {
                    ...state,
                    turn,
                    step,
                    blocks: book.blocks,
                    pricedTokens: book.pricedTokens,
                    pricedBlocks: book.pricedBlocks,
                    firstOutputTime,
                    latestOutputTime: event.time,
                    prevOutputTime: event.time,
                    outputTokens,
                    estimated: true,
                    tokensPerSecond: ewmaRate(state.tokensPerSecond, instantRateOf(added, fresh ? null : state.prevOutputTime, event.time)),
                };
            }
            case 'assistant/message': {
                // The stream finished: fold the assembled message's usage into the
                // exact buckets, then settle — the bar reports 0 while no stream is
                // active (see `settled`).
                if (!isTracked(state, event.data.turn, event.data.step))
                    return state;
                const reported = usageOutputTokens(event.data.usage);
                const outputTokens = reported !== null ? reported : state.outputTokens;
                const estimated = reported !== null ? false : state.estimated;
                return settled({ ...state, outputTokens, estimated });
            }
            case 'step/end': {
                // A step closed without a message (cancelled) settles the same way.
                if (!isTracked(state, event.data.turn, event.data.step))
                    return state;
                return settled(state);
            }
            case 'turn/end':
                return state.turn === null ? state : settled(state);
            default:
                return state;
        }
    },
    view: state => state.tokensPerSecond === null ? {} : { tokensPerSecond: state.tokensPerSecond },
    stateVersion: 3,
};
//# sourceMappingURL=live-rate.js.map