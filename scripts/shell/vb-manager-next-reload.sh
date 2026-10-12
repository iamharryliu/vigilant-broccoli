#!/bin/bash
# Fast-forward the current branch from its upstream, clear Next's build cache, then reload vb-manager-next via PM2.
# set -e aborts before the reload when the pull fails, so a reload never serves stale code.
set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

git -C "$REPO_ROOT" pull --ff-only
cd "$REPO_ROOT/projects/nx-workspace"
# Next's webpack cache keeps stale Tailwind CSS when only lib sources changed (~20s slower cold build).
rm -rf dist/apps/ui/vb-manager-next/.next/cache
nx run vb-manager-next:pm2:reload
