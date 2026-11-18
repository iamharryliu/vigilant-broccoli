#!/bin/bash
# Fails unless https://loki.harryliu.dev/health reports 200. The VM's health
# marker refreshes every 5 minutes, so it polls for up to ~7 minutes. Run after
# secret rotation: an expired Fly token stops vb-log-shipper silently and only
# this endpoint (also polled by Upptime) shows it.
set -u

URL="https://loki.harryliu.dev/health"
ATTEMPTS=14
INTERVAL=30

for i in $(seq 1 "$ATTEMPTS"); do
  code=$(curl -s -o /dev/null -m 15 -w '%{http_code}' "$URL" || true)
  if [ "$code" = "200" ]; then
    echo "✓ $URL is healthy"
    exit 0
  fi
  echo "[$i/$ATTEMPTS] $URL returned ${code:-000}; retrying in ${INTERVAL}s..."
  sleep "$INTERVAL"
done

echo "ERROR: $URL still unhealthy. Check \`pnpm logs:shipper:status\` / \`pnpm logs:shipper:logs\` (Authorization Violation = rejected ACCESS_TOKEN; fix with \`pnpm secret-rotation:fly-log-shipper\`)." >&2
exit 1
