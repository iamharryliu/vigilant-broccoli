#!/usr/bin/env bash
# Starts the job-hunt-next container with the Claude token from Vault, this
# repo's career folder and the manager page allowed to embed it, so no .env is
# needed. The folder is mounted whole because git and editors replace files with
# new inodes, which strands a single-file bind mount on a deleted copy.
set -euo pipefail

cd "$(dirname "$0")/../.."
. ./infrastructure/agent-sandbox/load-env-from-vault.sh

export CAREER_DIR="$PWD/notes/personal/career"
export JOB_HUNT_FRAME_ANCESTORS="'self' https://manager.vigilant-broccoli.app"

cd projects/nx-workspace
exec nx run job-hunt-next:docker:up
