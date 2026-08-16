#!/bin/bash
# Verify the committed lib/ artifacts are in sync with src/:
#   full rebuild (host tsc + client tsdown) then fail if the rebuilt
#   output differs from what is committed.
#
# Run before pushing anything that touches src/ (the repo's pre-push hook
# and the lib-sync CI workflow both use this property).
#
# Requires the same DSH_CHECKOUT as build.sh (development-only; end users
# never need it — v0.1.5+ installs ship a prebuilt lib/).
#
# Prereq: `pnpm install --frozen-lockfile` so the rebuild uses the exact
# toolchain recorded in pnpm-lock.yaml — a stale tsdown/typescript makes the
# byte-diff misleading (this is a false-positive trap, not a lib bug).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -d .git ]; then
  echo "verify: not a git work tree — nothing to compare against" >&2
  exit 1
fi

echo "=== verify: rebuilding host + client ==="
bash scripts/build.sh
npm run build:client

echo "=== verify: diff lib/ against HEAD ==="
# lib/*.map embed raw source text whose EOLs follow the building machine;
# they are debug-only, so the drift check compares the CODE artifacts
# (js / d.ts) byte-for-byte and skips maps.
if ! git diff --quiet --exit-code -- lib/ ':!lib/*.map'; then
  echo "verify: FAILED — lib/ is stale relative to src/." >&2
  echo "       The rebuild produced a different lib/ than what is committed." >&2
  echo "       Inspect:  git diff --stat -- lib/" >&2
  echo "       Fix:      commit the rebuilt lib/ and push again" >&2
  exit 1
fi
echo "=== verify: OK — lib/ matches src/ ==="