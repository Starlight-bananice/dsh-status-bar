#!/bin/bash
# Build dsh-status-bar:
#   1. compile host src/ → lib/ (tsc, declarations included)
#   2. compile client declarations src/client → lib/types/client (tsc)
#   3. bundle the browser half src/client → lib/client.js (tsdown)
#
# Everything resolves from this package's own node_modules: the DSH packages
# the plugin compiles against are pinned devDependencies (see package.json),
# so no DeepSeek Harness checkout is needed. Run `pnpm install` first.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TSC="./node_modules/.bin/tsc"
if [ ! -x "$TSC" ]; then
  echo "build: tsc not found — run \`pnpm install\` first" >&2
  exit 1
fi

CLIENT_ONLY="${1:-}"

if [ "$CLIENT_ONLY" = "--client-only" ]; then
  echo "=== Skipping host compile (--client-only) ==="
else
  echo "=== Compiling host src → lib ($("$TSC" --version)) ==="
  "$TSC" -p tsconfig.json
fi

echo "=== Compiling client declarations → lib/types/client ==="
"$TSC" -p tsconfig.client.json

echo "=== Bundling client → lib/client.js ==="
if [ "$CLIENT_ONLY" = "--client-only" ]; then
  pnpm exec tsdown
else
  ./node_modules/.bin/tsdown
fi

echo "=== Build complete ==="
ls -la lib/
