#!/bin/bash
set -e

VM_NAME="vb-free-vm"
VM_ZONE="us-east1-b"
GCP_PROJECT="vigilant-broccoli"

echo "Fetching unseal keys from Secret Manager..."
UNSEAL_KEYS=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_UNSEAL_KEYS \
  --project="${GCP_PROJECT}")

KEY1=$(echo "$UNSEAL_KEYS" | sed -n '1p')
KEY2=$(echo "$UNSEAL_KEYS" | sed -n '2p')
KEY3=$(echo "$UNSEAL_KEYS" | sed -n '3p')

echo "Unsealing Vault..."
gcloud compute ssh "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_SKIP_VERIFY=true

vault operator unseal ${KEY1} > /dev/null
vault operator unseal ${KEY2} > /dev/null
vault operator unseal ${KEY3} > /dev/null

if vault status 2>&1 | grep -q 'Sealed.*false'; then
  echo 'Vault unsealed successfully.'
else
  echo 'ERROR: Vault is still sealed.'
  exit 1
fi
"
