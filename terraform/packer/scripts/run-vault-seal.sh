#!/bin/bash
set -e

VM_NAME="vb-free-vm"
VM_ZONE="us-east1-b"
GCP_PROJECT="vigilant-broccoli"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Sealing Vault..."
gcloud compute ssh "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_SKIP_VERIFY=true
export VAULT_TOKEN='${VAULT_TOKEN}'

vault operator seal

if vault status 2>&1 | grep -q 'Sealed.*true'; then
  echo 'Vault sealed successfully.'
else
  echo 'ERROR: Vault is still unsealed.'
  exit 1
fi
"
