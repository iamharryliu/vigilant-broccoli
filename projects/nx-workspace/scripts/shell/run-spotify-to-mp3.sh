#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
NX_DIR="$REPO_DIR/projects/nx-workspace"
SPOTIFY_DIR="$REPO_DIR/scripts/python/dj-scripts/spotify-to-mp3"

INNER_CMD="cd $(printf '%q' "$SPOTIFY_DIR") && source venv/bin/activate && python download_music.py"
for arg in "$@"; do
  INNER_CMD="$INNER_CMD $(printf '%q' "$arg")"
done

cd "$NX_DIR"
NODE_EXTRA_CA_CERTS=./scripts/vault-ca.crt node --import tsx scripts/fetch-secrets.ts \
  --env-file "$SPOTIFY_DIR/.env.example" \
  "$INNER_CMD"
