#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"

echo "Verifying ${VAULT_OPS_ROLE_NAME} can mint a working token before revoking root..."
fetch_vault_ops_credentials
printf '%s\n%s\n' "$VAULT_OPS_ROLE_ID" "$VAULT_OPS_SECRET_ID" | gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

read -r ROLE_ID
read -r SECRET_ID
VAULT_TOKEN=\$(vault write -field=token auth/approle/login role_id=\"\$ROLE_ID\" secret_id=\"\$SECRET_ID\")
export VAULT_TOKEN

vault token lookup >/dev/null
echo '${VAULT_OPS_ROLE_NAME} token verified.'
"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Revoking Vault root token..."
printf '%s' "$VAULT_TOKEN" | gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
VAULT_TOKEN=\$(cat)
export VAULT_TOKEN

vault token revoke -self
"

echo "✓ Root token revoked. Recovery keys in VB_VM_VAULT_UNSEAL_KEYS remain valid — use 'vault operator generate-root' if a root token is ever needed again."
