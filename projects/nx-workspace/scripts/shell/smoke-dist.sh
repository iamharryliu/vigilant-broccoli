#!/usr/bin/env bash
#
# Boot the production dist of a service and confirm it answers HTTP.
# Catches missing-module crashes (e.g. transitive deps not in the pruned
# lockfile) before the artifact is pushed to a registry or deployed to fly.
#
# usage: smoke-dist.sh <dist-dir>
#
# Behavior:
# - If <dist-dir>/package.json exists and node_modules does not, runs
#   `pnpm install --frozen-lockfile --prod` first (matches Dockerfile).
# - Boots `node <dist-dir>/main.js` on a high port with dummy env values
#   sufficient to clear top-level module init for every service in this
#   repo (RESEND_API_KEY, SUPABASE_SECRET_KEY, SHARED_APP_TOKEN, and a
#   tmp DATABASE_PATH for services with a local SQLite db).
# - Polls GET / for up to 20s. Exits 0 on first 2xx, 1 if the process
#   dies or the timeout elapses.
set -euo pipefail

DIST_DIR="${1:?usage: smoke-dist.sh <dist-dir>}"
PORT="${SMOKE_PORT:-39871}"
TIMEOUT_SECONDS="${SMOKE_TIMEOUT_SECONDS:-20}"
HEALTH_PATH="${SMOKE_HEALTH_PATH:-/}"

if [ ! -f "$DIST_DIR/main.js" ]; then
  echo "smoke-dist: $DIST_DIR/main.js not found"
  exit 1
fi

# Run from a tmp directory outside the workspace so Node's module resolution
# can't walk up into the workspace root's node_modules — that hoisting would
# mask missing-dep failures we want to catch (the exact bug class that bit us
# on the express->fastify migration).
SMOKE_ROOT="$(mktemp -d -t smoke-dist.XXXXXX)"
SMOKE_DIR="$SMOKE_ROOT/svc"
mkdir -p "$SMOKE_DIR"
# rsync preserves symlinks (some workspace_modules entries are symlinks).
# Exclude node_modules so we always do a fresh prod install — pnpm's hoisted
# layout from a prior install could mask a missing-dep in pnpm-lock.yaml.
rsync -a --delete --exclude=node_modules "$DIST_DIR/" "$SMOKE_DIR/"

cleanup() {
  if [ -n "${SERVER_PID:-}" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$SMOKE_ROOT"
}
trap cleanup EXIT

if [ -f "$SMOKE_DIR/package.json" ] && [ ! -d "$SMOKE_DIR/node_modules" ]; then
  echo "smoke-dist: installing prod deps in $SMOKE_DIR"
  (
    cd "$SMOKE_DIR"
    pnpm install \
      --frozen-lockfile \
      --prod \
      --ignore-scripts \
      --ignore-workspace \
      --config.confirmModulesPurge=false
  )
fi

PORT="$PORT" \
HOST=127.0.0.1 \
SHARED_APP_TOKEN=smoke-test \
RESEND_API_KEY=re_smoke_dummy \
SUPABASE_SECRET_KEY=smoke-dummy \
DATABASE_PATH="$SMOKE_ROOT/smoke.sqlite" \
  node "$SMOKE_DIR/main.js" &
SERVER_PID=$!

DEADLINE=$(($(date +%s) + TIMEOUT_SECONDS))
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  if curl -fsS "http://127.0.0.1:$PORT$HEALTH_PATH" >/dev/null 2>&1; then
    echo "smoke passed: $DIST_DIR answered $HEALTH_PATH"
    exit 0
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "smoke failed: process exited before answering $HEALTH_PATH"
    exit 1
  fi
  sleep 0.5
done

echo "smoke failed: no response on http://127.0.0.1:$PORT$HEALTH_PATH within ${TIMEOUT_SECONDS}s"
exit 1
