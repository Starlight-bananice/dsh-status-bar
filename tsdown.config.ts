import { fileURLToPath } from 'node:url'
import type { UserConfig } from 'tsdown'

const PLUGIN_ID = '@bananiceee/dsh-status-bar'

// Externals are the shell's frozen module table (DSH 0.2.0-rc.2 seeds exactly
// react, react/jsx-runtime, react-dom, react-dom/client, @deepseek-ai/cordis,
// @deepseek-ai/dsh-client-store, @deepseek-ai/dsh-client-ui-slots,
// @deepseek-ai/dsh-client-ui-primitives and @deepseek-ai/dsh-client-ui-dockkit).
// Everything the bundle requires at runtime must be one of these, so the
// browser module system can answer the `require` from its seed table.
// Type-only imports of other @deepseek-ai packages are erased and create no
// request, which is why they need no entry here.
const CLIENT_EXTERNALS = [
  'react', 'react/jsx-runtime', 'react-dom', 'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
]

const clientBundle: UserConfig = {
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  deps: {
    neverBundle: [...CLIENT_EXTERNALS],
    alwaysBundle: (id: string) => !CLIENT_EXTERNALS.includes(id),
  },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: 'window.__ModuleLoader__.load({ id: ' + JSON.stringify(PLUGIN_ID) + ', factory: (require) => {',
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    codeSplitting: false,
  },
}

export default [clientBundle] satisfies UserConfig[]
