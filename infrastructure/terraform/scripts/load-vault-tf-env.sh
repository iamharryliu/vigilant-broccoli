#!/bin/bash
set -e

GCP_PROJECT="vigilant-broccoli"
BW_FOLDER="vb-vault-secrets"

export BITWARDEN_PASSWORD
BITWARDEN_PASSWORD=$(gcloud secrets versions access latest \
  --secret=BITWARDEN_PASSWORD \
  --project="${GCP_PROJECT}")

BW_SESSION=$(bw unlock --passwordenv BITWARDEN_PASSWORD --raw)
export BW_SESSION

FOLDER_ID=$(bw list folders --session "$BW_SESSION" | jq -r ".[] | select(.name == \"$BW_FOLDER\") | .id")

LATEST_ITEM=$(bw list items --folderid "$FOLDER_ID" --session "$BW_SESSION" \
  | jq -r '[.[] | select(.name | test("^vb-vault-secrets-[0-9]{4}-[0-9]{2}-[0-9]{2}$"))] | sort_by(.name) | last')
echo "Using Bitwarden note: $(echo "$LATEST_ITEM" | jq -r '.name')" >&2
SECRETS=$(echo "$LATEST_ITEM" | jq -r '.notes' | sed -n '/^{/,$p' | jq '.')

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
