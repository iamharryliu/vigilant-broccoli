#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"

APP_ID=$1
PEM_FILE=$2
GITHUB_API=https://api.github.com

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

NOW=$(date +%s)
HEADER=$(printf '{"alg":"RS256","typ":"JWT"}' | b64url)
PAYLOAD=$(printf '{"iat":%d,"exp":%d,"iss":"%s"}' "$((NOW - 60))" "$((NOW + 540))" "$APP_ID" | b64url)
SIGNATURE=$(printf '%s.%s' "$HEADER" "$PAYLOAD" | openssl dgst -sha256 -sign "$PEM_FILE" -binary | b64url)
JWT="${HEADER}.${PAYLOAD}.${SIGNATURE}"

INSTALLATION_ID=$(curl -fsS \
  -H "Authorization: Bearer ${JWT}" \
  -H "Accept: application/vnd.github+json" \
  "${GITHUB_API}/app/installations" | jq -r '.[0].id // empty')

if [ -z "$INSTALLATION_ID" ]; then
  echo "ERROR: GitHub App ${APP_ID} has no installations — install it on ${GITHUB_OWNER}/${GITHUB_REPO}." >&2
  exit 1
fi

curl -fsS -X POST \
  -H "Authorization: Bearer ${JWT}" \
  -H "Accept: application/vnd.github+json" \
  -d "{\"repositories\":[\"${GITHUB_REPO}\"]}" \
  "${GITHUB_API}/app/installations/${INSTALLATION_ID}/access_tokens" | jq -r '.token'
