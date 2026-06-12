#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../config.sh"

BW_FOLDER="vb-vault-secrets"

export BITWARDEN_PASSWORD
BITWARDEN_PASSWORD=$(gcloud secrets versions access latest \
  --secret=BITWARDEN_PASSWORD \
  --project="${GCP_PROJECT}")

BW_SESSION=$(bw unlock --passwordenv BITWARDEN_PASSWORD --raw)
export BW_SESSION

FOLDER_ID=$(bw list folders --session "$BW_SESSION" | jq -r ".[] | select(.name == \"$BW_FOLDER\") | .id")

ITEMS=$(bw list items --folderid "$FOLDER_ID" --session "$BW_SESSION")
LATEST_DATE=$(echo "$ITEMS" \
  | jq -r --arg base "$BW_FOLDER" '[.[] | .name | capture("^" + $base + "-(?<date>[0-9]{4}-[0-9]{2}-[0-9]{2})(-part[0-9]+)?$")? | .date] | sort | last')
echo "Using Bitwarden note: ${BW_FOLDER}-${LATEST_DATE}" >&2
NOTES=$(echo "$ITEMS" \
  | jq -r --arg base "${BW_FOLDER}-${LATEST_DATE}" '[.[] | select(.name == $base or (.name | startswith($base + "-part")))]
    | sort_by(((.name | capture("-part(?<n>[0-9]+)$") | .n | tonumber)? // 0))
    | map(.notes) | join("")')
SECRETS=$(echo "$NOTES" | sed -n '/^{/,$p' | jq '.')

KEY_MAP=(
  "CLOUDFLARE_API_TOKEN:CLOUDFLARE_API_TOKEN"
  "GITHUB_TOKEN:GITHUB_TOKEN"
)

for mapping in "${KEY_MAP[@]}"; do
  VAULT_KEY="${mapping%%:*}"
  ENV_VAR="${mapping##*:}"
  VALUE=$(echo "$SECRETS" | jq -r --arg key "$VAULT_KEY" '.[$key] // empty')
  if [ -n "$VALUE" ]; then
    echo "export ${ENV_VAR}=\"${VALUE}\""
  fi
done
