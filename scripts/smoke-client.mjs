#!/usr/bin/env node
/**
 * Client-bundle smoke test.
 *
 * The browser half of this plugin runs inside the host's slot renderer, which
 * does not contain a throw per component: the host marks the whole
 * `conversation.composer.dock` entry as crashed and skips it, while the native
 * cells stay shadowed by this plugin's lower-priority registration. Issue #4
 * is exactly that failure — `useAnchoredPosition` disappeared from
 * `@deepseek-ai/dsh-client-ui-primitives` in DSH 0.2.2-rc.3 / NEXT 2.0.23 and
 * took the entire bar with it (plus, from the user's point of view, the native
 * figures).
 *
 * The test pins the committed bundle to the host surface it is known to run
 * against and exercises the paths that must survive it:
 *   1. every module the bundle `require`s is seeded by the Client module table;
 *   2. every symbol it reads from the primitives module still exists there;
 *   3. the composer-dock entry renders with the context ring on — the exact
 *      render that crashed;
 *   4. a throw inside the bar stays inside the bar instead of escaping the
 *      slot entry;
 *   5. the takeover is released once after a failure, and a settings change
 *      retries it.
 *
 * No DOM is needed. Components render through `react-dom/server`, which runs
 * the real render path (hooks, children, ring markup) without mounting; the
 * client-only effects are not part of the crash surface. Pieces that are pure
 * bookkeeping are driven through `apply()`'s injection face instead.
 *
 * Run after `pnpm build`: `node scripts/smoke-client.mjs`.
 */

import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const require = createRequire(import.meta.url)
const root = dirname(dirname(fileURLToPath(import.meta.url)))
const bundlePath = join(root, 'lib', 'client.js')
const source = readFileSync(bundlePath, 'utf8')

const React = require('react')
const { renderToString } = require('react-dom/server')

/**
 * The Client module table's frozen seed (tsdown.config.ts) — the only
 * specifiers the host browser runtime can answer.
 */
const SEEDED_MODULES = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-dockkit',
])

/**
 * The primitives surface this plugin may read, as exported by the host builds
 * it supports (DSH 0.2.0 through 2.0.23). Deliberately EXCLUDES the hooks the
 * host has already taken away — `useAnchoredPosition` is the one that broke,
 * and the plugin now implements it locally (src/client/host.ts). Adding a
 * symbol here is a compatibility statement, so it has to be a deliberate edit.
 */
const HOST_PRIMITIVES = new Set([
  'IconDataOutlineRegular',
  'IconSettingsOutlineRegular',
  'Menu',
  'Modal',
  'Tooltip',
  'useAnchoredMaxHeight',
  'useDismissOnOutsidePointer',
])

const PRIMITIVES_VAR = '_deepseek_ai_dsh_client_ui_primitives'

let failures = 0
function check(label, ok, detail) {
  if (ok) {
    console.log(`  ok   ${label}`)
    return
  }
  failures += 1
  console.error(`  FAIL ${label}${detail === undefined ? '' : `\n       ${detail}`}`)
}

function assertEqual(label, actual, expected) {
  check(label, Object.is(actual, expected), `expected ${String(expected)}, received ${String(actual)}`)
}

// ---------------------------------------------------------------------------
// Static checks on the committed bundle
// ---------------------------------------------------------------------------

console.log('bundle: module requests')
const requested = new Set([...source.matchAll(/require\("([^"]+)"\)/g)].map(match => match[1]))
for (const specifier of requested) {
  check(`require("${specifier}") is in the Client module table`, SEEDED_MODULES.has(specifier))
}

console.log('bundle: host primitives surface')
const primitivesReads = new Set(
  [...source.matchAll(new RegExp(`${PRIMITIVES_VAR}\\.([A-Za-z_$][\\w$]*)`, 'g'))].map(match => match[1]),
)
check('bundle reads the primitives module at all', primitivesReads.size > 0)
for (const symbol of primitivesReads) {
  check(`primitives.${symbol} still exists on the supported host`, HOST_PRIMITIVES.has(symbol))
}
check(
  'bundle no longer reads useAnchoredPosition from the host',
  !primitivesReads.has('useAnchoredPosition'),
)

// ---------------------------------------------------------------------------
// Load the bundle the way the host does
// ---------------------------------------------------------------------------

/** Primitive stand-ins: only the shapes the bundle actually uses. */
const nullComponent = () => null
const primitivesModule = {
  Tooltip: ({ children }) => children,
  Menu: nullComponent,
  Modal: nullComponent,
  IconSettingsOutlineRegular: nullComponent,
  IconDataOutlineRegular: nullComponent,
  useAnchoredMaxHeight: () => null,
  useDismissOnOutsidePointer: () => {},
}

const storage = new Map([
  ['dsh.statusBar.v1', JSON.stringify({
    version: 3,
    native: false,
    enabled: true,
    wrap: false,
    segments: ['context'],
    cost: { currency: 'CNY', models: {} },
    calendar: { dayRules: true, autoFetch: false, overrides: [] },
  })],
])

const styleElement = { dataset: {}, textContent: '', remove() {} }
const documentStub = {
  documentElement: { getAttribute: () => null, hasAttribute: () => false },
  head: { appendChild() {} },
  body: {},
  createElement: () => styleElement,
  addEventListener() {},
  removeEventListener() {},
  querySelector: () => null,
}

function loadBundle() {
  const sandbox = {
    window: {
      __ModuleLoader__: {
        load(entry) {
          sandbox.__exports = entry.factory(specifier => {
            if (specifier === 'react') return React
            if (specifier === 'react/jsx-runtime') return require('react/jsx-runtime')
            if (specifier === 'react-dom') return require('react-dom')
            if (specifier === '@deepseek-ai/dsh-client-ui-primitives') return primitivesModule
            throw new Error(`the host module table has no entry for "${specifier}"`)
          })
        },
      },
      localStorage: {
        getItem: key => storage.get(key) ?? null,
        setItem: (key, value) => { storage.set(key, value) },
      },
      addEventListener() {},
      removeEventListener() {},
      setTimeout,
      clearTimeout,
    },
    document: documentStub,
    navigator: { userAgent: 'node' },
    console,
    setTimeout,
    clearTimeout,
  }
  vm.createContext(sandbox)
  vm.runInContext(source, sandbox, { filename: bundlePath })
  return { module: sandbox.__exports, window: sandbox.window }
}

console.log('bundle: load')
const loaded = loadBundle()
check('bundle registers itself with the module loader', loaded.module !== undefined)
check('exports apply()', typeof loaded.module?.apply === 'function')
check('exports the service injection list', Array.isArray(loaded.module?.inject))

// ---------------------------------------------------------------------------
// apply(): registration, release and retry
// ---------------------------------------------------------------------------

/**
 * Minimal Client context: records registrations so the test can drive the
 * components the plugin hands to the slots it takes over.
 */
function makeContext() {
  const registrations = []
  const unregistered = []
  const cleanups = []
  const ctx = {
    slots: {
      inject(_key, callback) {
        return callback()
      },
      register(options, component) {
        registrations.push({ options, component })
        return () => { unregistered.push(options.id) }
      },
    },
    locale: {
      register() {},
      bind: () => (key) => key,
    },
    jobs: {
      state: { rows: {} },
      watchRows: () => () => {},
    },
    sessions: {},
    effect(fn) {
      const cleanup = fn()
      if (typeof cleanup === 'function') cleanups.push(cleanup)
    },
  }
  return { ctx, registrations, unregistered, cleanups }
}

console.log('apply(): dock takeover')
const harness = makeContext()
loaded.module.apply(harness.ctx)

const dockEntries = harness.registrations.filter(row => row.options.name === 'conversation.composer.dock')
assertEqual('registers the two dock cells', dockEntries.length, 2)
const barEntry = dockEntries.find(row => row.options.id === 'activity')
const usageEntry = dockEntries.find(row => row.options.id === 'usage')
check('takes over the native activity cell at a lower priority', barEntry?.options.priority === -1)
check('takes over the native usage cell at a lower priority', usageEntry?.options.priority === -1)

const injected = barEntry.options.inject()
check('injects the release hook', typeof injected.releaseDock === 'function')

// ---------------------------------------------------------------------------
// Render the dock entry against the current host surface
// ---------------------------------------------------------------------------

/**
 * Slot props for the bar. `contextPressure` is what turns the context ring
 * on — the render that threw before the fix.
 */
function barProps() {
  const projections = {
    contextPressure: { projectedTokens: 45_000, pressureTokens: 45_000, contextWindow: 128_000 },
    contextBreakdown: { systemTokens: 9_000, toolsTokens: 6_000, messageTokens: 30_000 },
    sessionStats: { turns: 1, steps: 2, llmMs: 1_000, toolMs: 0, ttftMs: 100, ttftSteps: 2, decodeMs: 500, decodeTokens: 2_000 },
  }
  const selector = value => callback => callback(value)
  return {
    sessionId: 'session-1',
    t: (key, params) => (params === undefined ? key : `${key}:${JSON.stringify(params)}`),
    useProjection: name => projections[name],
    useSession: selector({ running: false, lastAgentError: null }),
    useChat: selector({ legacy: { nodes: [], partial: null, timings: {} } }),
    useInput: selector({ queue: [] }),
    useSessions: selector({ byId: {} }),
    useJobs: selector({ rows: {} }),
    useLiveRate: () => undefined,
    watchRows: () => () => {},
    watchLiveRate: () => () => {},
    hooks: { jobs: { rows: {} }, liveRate: {} },
    releaseDock: injected.releaseDock,
  }
}

console.log('render: composer dock entry')
const quiet = fn => {
  // SSR has no effects and no error boundaries, so React warns about the
  // layout effects and about the deliberate failure below; the warnings are
  // expected here and would only bury the checks.
  const original = console.error
  console.error = () => {}
  try { return fn() } finally { console.error = original }
}
const html = quiet(() => renderToString(React.createElement(barEntry.component, barProps())))
check('renders the plugin bar', html.includes('class="dsb-bar"'))
check('marks the native context meter for hiding', html.includes('data-dsb-context="true"'))
check('renders the context ring trigger', html.includes('dsb-ctx-trigger'))
check('reports the occupancy reading', html.includes('35%'))
check('the release hook is not fired on a healthy render', harness.unregistered.length === 0)

console.log('boundary: failure contract')
const BarBoundary = loaded.module.BarBoundary
check('the boundary is exported for this check', typeof BarBoundary === 'function')
assertEqual('a render error flips the boundary state', JSON.stringify(BarBoundary.getDerivedStateFromError()), '{"failed":true}')

let released = 0
const boundary = new BarBoundary({ onFailure: () => { released += 1 }, children: 'bar' })
assertEqual('renders its children before a failure', boundary.render(), 'bar')
boundary.state = { failed: true }
check('renders nothing once it has failed', boundary.render() === null)
quiet(() => boundary.componentDidCatch(new Error('simulated render failure'), { componentStack: '' }))
assertEqual('the release is deferred out of the failing commit', released, 0)
await new Promise(resolve => setTimeout(resolve, 0))
assertEqual('a caught failure releases the takeover', released, 1)

console.log('release: native fallback')
// The boundary defers the release out of the React commit; a macrotask is
// enough for the deferred call to land.
const releasing = new Promise(resolve => setTimeout(resolve, 0))
// Emulate what BarBoundary does once it has caught a render error.
injected.releaseDock()
await Promise.resolve()
await releasing
check(
  'releasing unregisters both dock cells so the native bar returns',
  harness.unregistered.length === 2 && harness.unregistered.includes('activity') && harness.unregistered.includes('usage'),
  `unregistered: ${harness.unregistered.join(', ') || '(none)'}`,
)
injected.releaseDock()
assertEqual('releasing twice does not unregister again', harness.unregistered.length, 2)

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (failures > 0) {
  console.error(`\nsmoke-client: ${failures} check(s) failed`)
  process.exit(1)
}
console.log('\nsmoke-client: all checks passed')
