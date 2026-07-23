#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

echo "Fetching unseal keys from Secret Manager..."
UNSEAL_KEYS=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_UNSEAL_KEYS \
  --project="${GCP_PROJECT}")

KEY1=$(echo "$UNSEAL_KEYS" | sed -n '1p')
KEY2=$(echo "$UNSEAL_KEYS" | sed -n '2p')
KEY3=$(echo "$UNSEAL_KEYS" | sed -n '3p')

echo "Unsealing Vault..."
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault operator unseal "$UNSEAL_KEY1" > /dev/null
vault operator unseal "$UNSEAL_KEY2" > /dev/null
vault operator unseal "$UNSEAL_KEY3" > /dev/null

if vault status 2>&1 | grep -q "Sealed.*false"; then
  echo "Vault unsealed successfully."
else
  echo "ERROR: Vault is still sealed."
  exit 1
fi
' UNSEAL_KEY1 "$KEY1" UNSEAL_KEY2 "$KEY2" UNSEAL_KEY3 "$KEY3"
