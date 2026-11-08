#!/usr/bin/env bash
# Waits until the socket server answers an unauthenticated POST /publish with 401,
# which only images with the HTTP publish/SSE transport do (older ones return 404).
# Watchtower polls Docker Hub every 5 minutes, so the new image can go live several
# minutes after deploy-fanout fires these checks.
set -euo pipefail

: "${SOCKET_SERVER_URL:?SOCKET_SERVER_URL is required}"
ATTEMPTS=40
INTERVAL_S=15
EXPECTED_STATUS=401

STATUS=''
for _ in $(seq 1 "$ATTEMPTS"); do
  STATUS=$(curl -sk -o /dev/null -w '%{http_code}' --max-time 10 -X POST "${SOCKET_SERVER_URL}/publish" || true)
  if [ "$STATUS" = "$EXPECTED_STATUS" ]; then
    echo "✓ ${SOCKET_SERVER_URL}/publish is live"
    exit 0
  fi
  echo "Waiting for ${SOCKET_SERVER_URL}/publish (got ${STATUS})..."
  sleep "$INTERVAL_S"
done
echo "✗ ${SOCKET_SERVER_URL}/publish never returned ${EXPECTED_STATUS} (last: ${STATUS})"
exit 1
