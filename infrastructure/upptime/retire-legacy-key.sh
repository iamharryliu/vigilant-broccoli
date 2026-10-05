#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"
source "${SCRIPT_DIR}/../lib/ssh-secrets.sh"

SOURCE_REPOSITORY="${GITHUB_OWNER}/${GITHUB_REPO}"
LEGACY_WORKFLOWS=$(gh api "repos/${SOURCE_REPOSITORY}/contents/.github/workflows?ref=main" \
  --jq '[.[] | select(.name == "cron-upptime.yml" or .name == "cron-upptime-response-time.yml")] | length')
if [ "$LEGACY_WORKFLOWS" != 0 ]; then
  echo "Merge the legacy workflow cleanup before retiring its key." >&2
  exit 1
fi

MONITORING_REPOSITORY=$(gh variable get UPPTIME_REPOSITORY --repo "$SOURCE_REPOSITORY")
if [ "$(gh variable get UPPTIME_MONITORING_ENABLED --repo "$MONITORING_REPOSITORY")" != true ]; then
  echo "Enable monitoring schedules before retiring the legacy key." >&2
  exit 1
fi
if ! gh run list --repo "$MONITORING_REPOSITORY" --workflow cron-upptime \
  --event schedule --status success --limit 1 --json databaseId | jq -e 'length > 0' >/dev/null; then
  echo "Wait for a successful scheduled uptime check before retiring the legacy key." >&2
  exit 1
fi

VAULT_TOKEN=$(gcloud secrets versions access latest --secret=VB_VM_VAULT_ROOT_TOKEN --project="$GCP_PROJECT")
gcloud_ssh_secrets "$VM_NAME" "$GCP_ZONE" '
set -euo pipefail
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
LEGACY_KEY=UPPTIME_GH_APP_PRIVATE_KEY
jq -cn --arg key "$LEGACY_KEY" "{(\$key): null}" | vault kv patch kv/secrets - >/dev/null
vault kv get -format=json kv/secrets | jq -e --arg key "$LEGACY_KEY" ".data.data | has(\$key) | not" >/dev/null
' VAULT_TOKEN "$VAULT_TOKEN"
echo "Removed the legacy Upptime App key from the current Vault secret version."
