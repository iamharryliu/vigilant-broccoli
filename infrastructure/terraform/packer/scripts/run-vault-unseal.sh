#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

echo "Fetching unseal keys from Secret Manager..."
UNSEAL_KEYS=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_UNSEAL_KEYS \
  --project="${GCP_PROJECT}")

# `vault operator unseal` with no positional key argument reads one line from
# stdin per invocation — piping the keys in (recovery-threshold=3, so only the
# first 3 of the 5 stored keys get consumed) keeps them out of the remote
# process's argv, unlike passing them as CLI arguments.
echo "Unsealing Vault..."
printf '%s\n' "$UNSEAL_KEYS" | gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault operator unseal > /dev/null
vault operator unseal > /dev/null
vault operator unseal > /dev/null

if vault status 2>&1 | grep -q 'Sealed.*false'; then
  echo 'Vault unsealed successfully.'
else
  echo 'ERROR: Vault is still sealed.'
  exit 1
fi
"
