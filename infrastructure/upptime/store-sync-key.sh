#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"
source "${SCRIPT_DIR}/../lib/ssh-secrets.sh"

KEY_FILE=${1:?Usage: store-sync-key.sh /path/to/downloaded-app-key.pem}
openssl pkey -in "$KEY_FILE" -noout >/dev/null
APP_KEY=$(base64 < "$KEY_FILE" | tr -d '\n')
VAULT_TOKEN=$(gcloud secrets versions access latest --secret=VB_VM_VAULT_ROOT_TOKEN --project="$GCP_PROJECT")

gcloud_ssh_secrets "$VM_NAME" "$GCP_ZONE" '
set -euo pipefail
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
printf "%s" "$APP_KEY" | jq -Rs "{UPPTIME_SYNC_GH_APP_PRIVATE_KEY: .}" | vault kv put kv/upptime-sync - >/dev/null
' VAULT_TOKEN "$VAULT_TOKEN" APP_KEY "$APP_KEY"
echo "Stored the sync App key in kv/upptime-sync."
