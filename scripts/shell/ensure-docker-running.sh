#!/bin/bash
# Starts Docker Desktop when the daemon is not running and waits up to 120s for it; exits non-zero when it never becomes ready.
set -e

if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running; starting Docker Desktop..."
  open -a Docker
  DOCKER_WAIT_SECONDS=120
  waited=0
  until docker info > /dev/null 2>&1; do
    if [ "$waited" -ge "$DOCKER_WAIT_SECONDS" ]; then
      echo "Docker did not become ready within ${DOCKER_WAIT_SECONDS}s." >&2
      exit 1
    fi
    sleep 2
    waited=$((waited + 2))
  done
fi
