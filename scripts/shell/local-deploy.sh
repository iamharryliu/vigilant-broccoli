#!/bin/bash
# Fast-forward the current branch from its upstream, install nx-workspace dependencies, reload every local PM2 app from its ecosystem file, then rebuild the job-hunt-next Docker container, first starting Docker Desktop (waiting up to 120s) when the daemon is not running.
# set -e aborts before any reload when the pull fails, so a reload never serves stale code.
# The zone apps go first: local-manager-next rewrites /dev-dashboard/cloud, /dev-dashboard/local and /music/app to them.
set -e
# Nx's interactive TUI waits for `q` after multi-task runs (pm2:reload dependsOn build), stalling the sequence.
export NX_TUI=false

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

git -C "$REPO_ROOT" pull --ff-only
# The nx-workspace is its own pnpm workspace, so a root `pnpm i` skips dependencies added by the pulled commits.
pnpm --dir "$REPO_ROOT/projects/nx-workspace" install --frozen-lockfile
cd "$REPO_ROOT/projects/nx-workspace"
nx run cloud-services-next:pm2:reload
nx run local-services-next:pm2:reload
nx run music-next:pm2:reload
nx run local-manager-next:pm2:reload

# Checked after the PM2 reloads so Docker startup never delays them.
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running; starting Docker Desktop..."
  open -a Docker
  DOCKER_WAIT_SECONDS=120
  waited=0
  until docker info > /dev/null 2>&1; do
    if [ "$waited" -ge "$DOCKER_WAIT_SECONDS" ]; then
      echo "Docker did not become ready within ${DOCKER_WAIT_SECONDS}s; aborting job-hunt-next rebuild." >&2
      exit 1
    fi
    sleep 2
    waited=$((waited + 2))
  done
fi
pnpm --dir "$REPO_ROOT" job-hunt:docker:up
