#!/bin/bash
# Prints one Vault secret to stdout: ./load-vault-secret.sh KEY
# Same Vault-over-IAP path as load-tailscale-authkey.sh; nothing is written to
# disk. Callers capture it into a variable rather than a file.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"
source "${SCRIPT_DIR}/../lib/ssh-secrets.sh"

VAULT_KEY="${1:-}"
if [ -z "$VAULT_KEY" ]; then
  echo "Usage: $(basename "$0") VAULT_KEY" >&2
  exit 1
fi

echo "Fetching root token from Secret Manager..." >&2
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Fetching ${VAULT_KEY} from Vault..." >&2
VALUE=$(gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv get -format=json '"${VAULT_KV_PATH}"'/secrets | jq -r ".data.data.'"${VAULT_KEY}"' // empty"
' VAULT_TOKEN "$VAULT_TOKEN")

if [ -z "$VALUE" ]; then
  echo "ERROR: ${VAULT_KEY} not found in Vault (${VAULT_KV_PATH}/secrets). Store it with: vault kv patch ${VAULT_KV_PATH}/secrets ${VAULT_KEY}=..." >&2
  exit 1
fi

printf '%s' "$VALUE"
echo "✓ Loaded ${VAULT_KEY} (session only — nothing written to disk)" >&2
