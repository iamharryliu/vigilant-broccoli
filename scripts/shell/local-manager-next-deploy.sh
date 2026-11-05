#!/bin/bash
# Fast-forward the current branch from its upstream, then reload local-manager-next via PM2.
# set -e aborts before the reload when the pull fails, so a reload never serves stale code.
set -e
# Nx's interactive TUI waits for `q` after multi-task runs (pm2:reload dependsOn build), stalling the script.
export NX_TUI=false

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

git -C "$REPO_ROOT" pull --ff-only
cd "$REPO_ROOT/projects/nx-workspace"
nx run local-manager-next:pm2:reload
