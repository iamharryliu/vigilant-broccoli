#!/bin/bash
# Fast-forward the current branch from its upstream, then reload every local PM2 app from its ecosystem file.
# set -e aborts before any reload when the pull fails, so a reload never serves stale code.
# The zone apps go first: local-manager-next rewrites /dev-dashboard/cloud and /dev-dashboard/local to them.
set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

git -C "$REPO_ROOT" pull --ff-only
cd "$REPO_ROOT/projects/nx-workspace"
nx run cloud-services-next:pm2:reload
nx run local-services-next:pm2:reload
nx run local-manager-next:pm2:reload
