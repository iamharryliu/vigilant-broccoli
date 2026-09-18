#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../config.sh"

BW_FOLDER="vb-vault-secrets"
BW_LOGIN_EMAIL="harryliu1995@gmail.com"

TF_HOST="app.terraform.io"
TF_CREDENTIALS_FILE="${HOME}/.terraform.d/credentials.tfrc.json"

TF_TOKEN=$(jq -r --arg host "$TF_HOST" '.credentials[$host].token // empty' "$TF_CREDENTIALS_FILE" 2>/dev/null)
if [ -z "${TF_TOKEN_app_terraform_io:-}" ] && [ -z "$TF_TOKEN" ]; then
  echo "Terraform CLI is not logged in. Run: terraform login" >&2
  exit 1
fi

BW_STATUS=$(bw status | jq -r '.status')
if [ "$BW_STATUS" = "unauthenticated" ]; then
  echo "Bitwarden CLI is not logged in. Run: bw login ${BW_LOGIN_EMAIL}" >&2
  exit 1
fi

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
  "TF_GITHUB_TOKEN:GITHUB_TOKEN"
  "SUPABASE_ACCESS_TOKEN:SUPABASE_ACCESS_TOKEN"
  "GOOGLE_AUTH_PROVIDER_CLIENT_SECRET:TF_VAR_supabase_google_client_secret"
  "TF_AWS_ACCESS_KEY_ID:AWS_ACCESS_KEY_ID"
  "TF_AWS_SECRET_ACCESS_KEY:AWS_SECRET_ACCESS_KEY"
  "CLAUDE_CODE_OAUTH_TOKEN:TF_VAR_claude_code_oauth_token"
)

# Warn rather than exit: exiting would withhold every other export too, leaving
# the cloudflare/github/supabase providers unconfigured over a missing AWS key.
# CLAUDE_CODE_OAUTH_TOKEN defaults to "" in variables.tf, so a missing value
# builds a code-server VM whose claude needs a login instead of failing the plan.
WARN_IF_MISSING_KEYS=(
  "TF_AWS_ACCESS_KEY_ID"
  "TF_AWS_SECRET_ACCESS_KEY"
  "CLAUDE_CODE_OAUTH_TOKEN"
)

for mapping in "${KEY_MAP[@]}"; do
  VAULT_KEY="${mapping%%:*}"
  ENV_VAR="${mapping##*:}"
  VALUE=$(echo "$SECRETS" | jq -r --arg key "$VAULT_KEY" '.[$key] // empty')
  if [ -n "$VALUE" ]; then
    echo "export ${ENV_VAR}=\"${VALUE}\""
  elif [[ " ${WARN_IF_MISSING_KEYS[*]} " == *" ${VAULT_KEY} "* ]]; then
    # Otherwise the aws provider quietly falls back to whatever is left in
    # ~/.aws -- usually an expired SSO cache, which fails mid-plan instead of here.
    echo "Warning: ${VAULT_KEY} missing from the Bitwarden note — its consumer (aws provider or code-server's claude) will run unauthenticated. Add it to Vault, then re-run backup-secrets.sh." >&2
  fi
done
