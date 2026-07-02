#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Fetching SHARED_APP_TOKEN from Vault..."
SHARED_APP_TOKEN=$(gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${VAULT_TOKEN}'

vault kv get -field=SHARED_APP_TOKEN ${VAULT_KV_PATH}/secrets
" | tr -d '[:space:]')

if [ -z "$SHARED_APP_TOKEN" ]; then
  echo "Failed to fetch SHARED_APP_TOKEN from Vault" >&2
  exit 1
fi

OCI_VM_IP=$(cd "${SCRIPT_DIR}/../.." && terraform output -raw oci_vm_public_ip)

echo "Updating SENDER_TOKEN on socket-server VM (${OCI_VM_IP})..."
printf '%s' "$SHARED_APP_TOKEN" | ssh -i ~/.ssh/id_ed25519 "ubuntu@${OCI_VM_IP}" '
NEW_TOKEN=$(cat)
sudo sed -i "s/SENDER_TOKEN: .*/SENDER_TOKEN: $NEW_TOKEN/" /opt/rabbitmq/docker-compose.yml
sudo docker compose -f /opt/rabbitmq/docker-compose.yml up -d
'
echo "SENDER_TOKEN synced with Vault."
