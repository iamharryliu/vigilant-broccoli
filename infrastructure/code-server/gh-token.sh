#!/bin/bash
# Prints the GitHub App installation token the
# manual-refresh-code-server-github-token workflow last delivered to the VM,
# refusing once it has expired. Installed as /usr/local/bin/gh-token by the
# code-server Dockerfile; the gh wrapper feeds it to gh and to git's
# `gh auth git-credential` helper.
set -euo pipefail

TOKEN_FILE=${GH_TOKEN_FILE:-/run/secrets/gh-token.json}
REFRESH_HINT="run 'pnpm gh:actions:refresh-code-server-github-token' to deliver a fresh one"

if [ ! -s "$TOKEN_FILE" ]; then
  echo "gh-token: no token at $TOKEN_FILE — $REFRESH_HINT" >&2
  exit 1
fi

EXPIRES_AT=$(jq -r '.expires_at // 0' "$TOKEN_FILE")
if [ "$(date +%s)" -ge "$EXPIRES_AT" ]; then
  echo "gh-token: token at $TOKEN_FILE has expired — $REFRESH_HINT" >&2
  exit 1
fi

jq -r '.token' "$TOKEN_FILE"
