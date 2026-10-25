#!/bin/bash
# Triggers a Jellyfin library scan: ./jellyfin-scan.sh (pnpm jellyfin:scan)
#
# Real-time monitoring should see files written to the library over the SMB
# share now that it is on local ext4, but it is per-library, switchable off,
# and unreliable for a file still being written. This is the explicit trigger.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

JELLYFIN_PORT="${JELLYFIN_PORT:-8096}"
ADDRESS=$(./pi-ssh.sh --host)

API_KEY="${JELLYFIN_API_KEY:-}"
if [ -z "$API_KEY" ]; then
  API_KEY=$(./load-vault-secret.sh JELLYFIN_API_KEY)
fi

# The key goes through a curl config on stdin rather than -H: argv is readable
# by every other process on this laptop.
printf 'header = "Authorization: MediaBrowser Token=\\"%s\\""\n' "$API_KEY" |
  curl -fsS -K - -X POST "http://${ADDRESS}:${JELLYFIN_PORT}/Library/Refresh"

echo "✓ Library scan started on ${ADDRESS} — progress is in Dashboard → Scheduled Tasks"
