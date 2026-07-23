#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Sealing Vault..."
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault operator seal

if vault status 2>&1 | grep -q "Sealed.*true"; then
  echo "Vault sealed successfully."
else
  echo "ERROR: Vault is still unsealed."
  exit 1
fi
' VAULT_TOKEN "$VAULT_TOKEN"
