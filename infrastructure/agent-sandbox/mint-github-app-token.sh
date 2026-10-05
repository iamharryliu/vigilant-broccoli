#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"

APP_ID=$1
PEM_FILE=$2
TARGET_REPO=${3:-$GITHUB_REPO}
TARGET_OWNER=${4:-$GITHUB_OWNER}
TOKEN_PERMISSIONS=${5:-}
GITHUB_API=https://api.github.com

# Vault stores the key base64-encoded, but some callers hand over an
# already-decoded PEM, so normalise here rather than at each call site: a
# caller that forgets the decode looks fine until openssl rejects the key at
# run time ("Could not read private key ... STORE routines ... unsupported"),
# which is how cron-agentic-todo-audit shipped broken.
PEM_CONTENT=$(cat "$PEM_FILE")
case "$PEM_CONTENT" in
  -----BEGIN*) ;;
  *)
    if ! PEM_CONTENT=$(printf '%s' "$PEM_CONTENT" | base64 -d 2>/dev/null) ||
      [ "${PEM_CONTENT#-----BEGIN}" = "$PEM_CONTENT" ]; then
      echo "ERROR: private key for GitHub App ${APP_ID} is neither PEM nor base64-encoded PEM." >&2
      exit 1
    fi
    ;;
esac

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

NOW=$(date +%s)
HEADER=$(printf '{"alg":"RS256","typ":"JWT"}' | b64url)
PAYLOAD=$(printf '{"iat":%d,"exp":%d,"iss":"%s"}' "$((NOW - 60))" "$((NOW + 540))" "$APP_ID" | b64url)
# Process substitution keeps the key off disk. openssl reads a PEM from the
# resulting pipe without complaint — a "Could not read private key from
# /dev/fd/N" here means the content is not a PEM, not that the fd is a pipe.
SIGNATURE=$(printf '%s.%s' "$HEADER" "$PAYLOAD" |
  openssl dgst -sha256 -sign <(printf '%s\n' "$PEM_CONTENT") -binary | b64url)
JWT="${HEADER}.${PAYLOAD}.${SIGNATURE}"

if [ "${GITHUB_ACTIONS:-}" = true ]; then
  echo "::add-mask::$JWT" >&2
fi

INSTALLATION_ID=$(curl -fsS \
  -H "Authorization: Bearer ${JWT}" \
  -H "Accept: application/vnd.github+json" \
  "${GITHUB_API}/repos/${TARGET_OWNER}/${TARGET_REPO}/installation" | jq -r '.id // empty')

if [ -z "$INSTALLATION_ID" ]; then
  echo "ERROR: GitHub App ${APP_ID} has no installation on ${TARGET_OWNER}/${TARGET_REPO}." >&2
  exit 1
fi

TOKEN_REQUEST=$(jq -cn --arg repo "$TARGET_REPO" '{repositories: [$repo]}')
if [ -n "$TOKEN_PERMISSIONS" ]; then
  TOKEN_REQUEST=$(jq -c --argjson permissions "$TOKEN_PERMISSIONS" '. + {permissions: $permissions}' <<< "$TOKEN_REQUEST")
fi

TOKEN=$(curl -fsS -X POST \
  -H "Authorization: Bearer ${JWT}" \
  -H "Accept: application/vnd.github+json" \
  -d "$TOKEN_REQUEST" \
  "${GITHUB_API}/app/installations/${INSTALLATION_ID}/access_tokens" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "ERROR: GitHub App ${APP_ID} did not return an installation token." >&2
  exit 1
fi
printf '%s\n' "$TOKEN"
