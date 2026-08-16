#!/bin/bash
# Build dsh-status-bar:
#   1. probe the dsh checkout (DSH_CHECKOUT or common paths)
#   2. junction-link the plugin INTO the checkout so tsconfig.client.json
#      relative paths (../packages/...) and node_modules resolution work
#   3. compile host src/ → lib/ with the checkout's tsc
#   4. typecheck the client (tsc --noEmit via the junction)
# The UI bundle itself is produced by `npm run build:client` (tsdown).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── 1. locate the checkout ────────────────────────────────────────────────
CHECKOUT="${DSH_CHECKOUT:-}"
if [ -z "$CHECKOUT" ] || [ ! -d "$CHECKOUT/packages" ]; then
  for cand in \
    "$HOME/deepseek-harness" \
    "$HOME/Documents/deepseek-harness" \
    "$HOME/dsh" \
    "$HOME/Documents/dsh/../deepseek-harness" \
    "/opt/deepseek-harness" \
    "/workspace/deepseek-harness"; do
    if [ -d "$cand/packages" ]; then CHECKOUT="$cand"; break; fi
  done
fi
if [ -z "$CHECKOUT" ] || [ ! -d "$CHECKOUT/packages" ]; then
  echo "build: cannot locate the dsh checkout (set DSH_CHECKOUT)" >&2
  echo "       v0.1.5+ installs ship prebuilt lib/ — end users do NOT need" >&2
  echo "       build.sh. It is only for plugin development; see README →" >&2
  echo "       Development for how to point it at a DeepSeek Harness checkout." >&2
  exit 1
fi
echo "=== Checkout: $CHECKOUT ==="

TSC="$CHECKOUT/node_modules/.bin/tsc"
if [ ! -x "$TSC" ]; then
  echo "build: tsc not found at $TSC" >&2
  exit 1
fi

# ── 2. junction the plugin into the checkout (client typecheck needs the
#       ../packages/... view; harmless if it already exists) ───────────────
JUNCTION="$CHECKOUT/dsh-status-bar"
if [ ! -e "$JUNCTION" ]; then
  ln -s "$ROOT" "$JUNCTION"
  echo "=== Linked $JUNCTION -> $ROOT"
fi

# ── 2b. client typecheck dependencies: react/react-dom and the @deepseek-ai
#       type packages are pnpm-nested inside the checkout; junction them into
#       our node_modules so tsc resolves them by ordinary node resolution
#       (tsdown treats the @deepseek-ai/* names as externals — no runtime
#       effect). ─────────────────────────────────────────────────────────────
link_dir() {
  local link="$1" target="$2"
  if [ -e "$link" ]; then return 0; fi
  if [ ! -e "$target" ]; then echo "build: dependency target missing: $target" >&2; return 1; fi
  mkdir -p "$(dirname "$link")"
  ln -s "$target" "$link"
}
REACT_SRC="$CHECKOUT/packages/client/ui-primitives/node_modules/react"
REACT_DOM_SRC="$CHECKOUT/packages/client/ui-primitives/node_modules/react-dom"
if [ -d "$REACT_SRC" ]; then
  link_dir "$ROOT/node_modules/react" "$REACT_SRC"
  link_dir "$ROOT/node_modules/react-dom" "$REACT_DOM_SRC"
fi
REACT_TYPES_SRC="$(find "$CHECKOUT/node_modules/.pnpm" -maxdepth 1 -type d -name '@types+react@*' 2>/dev/null | head -1)"
if [ -n "$REACT_TYPES_SRC" ]; then
  link_dir "$ROOT/node_modules/@types/react" "$REACT_TYPES_SRC/node_modules/@types/react"
fi
REACT_DOM_TYPES_SRC="$(find "$CHECKOUT/node_modules/.pnpm" -maxdepth 1 -type d -name '@types+react-dom@*' 2>/dev/null | head -1)"
if [ -n "$REACT_DOM_TYPES_SRC" ]; then
  link_dir "$ROOT/node_modules/@types/react-dom" "$REACT_DOM_TYPES_SRC/node_modules/@types/react-dom"
fi

mkdir -p "$ROOT/node_modules/@deepseek-ai"
# Subpath imports resolve straight to the checkout's lib/types (no base-package
# link, so no junction lands inside a linked package dir).
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-client-runtime/client" "$CHECKOUT/packages/client/runtime/lib/types/client"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-client-ui-slots" "$CHECKOUT/packages/client/ui-slots"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-client-ui-primitives" "$CHECKOUT/packages/client/ui-primitives"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-client-ui-conversation/client" "$CHECKOUT/packages/client/ui-conversation/lib/types/client"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-client-ui-settings/client" "$CHECKOUT/packages/client/ui-settings/lib/types/client"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-client-locale/client" "$CHECKOUT/packages/client/locale/lib/types/client"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-client-connection/client" "$CHECKOUT/packages/client/connection/lib/types/client"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-session-stats/client.d.ts" "$CHECKOUT/packages/session/session-stats/lib/types/client.d.ts"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-token-meter/client.d.ts" "$CHECKOUT/packages/llm/token-meter/lib/types/client.d.ts"

# Host-side compile dependencies (the full package dirs; the client resolves
# '/types' through the generated tsconfig template instead, so nothing lands
# inside these linked dirs).
link_dir "$ROOT/node_modules/cordis" "$CHECKOUT/vendor/cordis"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-session-projection" "$CHECKOUT/packages/session/session-projection"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-session" "$CHECKOUT/packages/core/session"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-llm" "$CHECKOUT/packages/llm/llm"
link_dir "$ROOT/node_modules/@deepseek-ai/dsh-host-webserver" "$CHECKOUT/packages/host/webserver"
ZOD_SRC="$(find "$CHECKOUT/node_modules/.pnpm" -maxdepth 1 -type d -name 'zod@*' 2>/dev/null | head -1)"
if [ -n "$ZOD_SRC" ]; then
  link_dir "$ROOT/node_modules/zod" "$ZOD_SRC/node_modules/zod"
fi
NODE_TYPES_SRC="$(find "$CHECKOUT/node_modules/.pnpm" -maxdepth 1 -type d -name '@types+node@*' 2>/dev/null | head -1)"
if [ -n "$NODE_TYPES_SRC" ]; then
  link_dir "$ROOT/node_modules/@types/node" "$NODE_TYPES_SRC/node_modules/@types/node"
fi

# ── 3. compile host src/ → lib/ (no-op entry; keeps the bundle loadable) ──
CLIENT_ONLY="${1:-}"
if [ "$CLIENT_ONLY" = "--client-only" ]; then
  echo "=== Skipping host compile (--client-only) ==="
else
  TSC_VERSION="$("$TSC" --version)"
  echo "=== Compiling host src → lib ($TSC_VERSION) ==="
  "$TSC" -p tsconfig.json
fi

# ── 4. typecheck the client (via a generated tsconfig whose paths carry the
#       checkout's absolute location — a relative view would resolve against
#       this repo's own path) ───────────────────────────────────────────────
mkdir -p "$ROOT/.client-build"
sed "s|__CHECKOUT__|$CHECKOUT|g" "$ROOT/scripts/tsconfig.client.template.json" > "$ROOT/.client-build/tsconfig.client.json"
echo "=== Typechecking client (tsc --noEmit) ==="
"$TSC" -p "$ROOT/.client-build/tsconfig.client.json" --noEmit

echo "=== Build complete ==="
ls -la lib/ 2>/dev/null
