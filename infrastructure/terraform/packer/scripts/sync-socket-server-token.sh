#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

SOCKET_SERVER_HOST="socket.harryliu.dev"

# CI mode (VAULT_ADDR set by the rotate-secrets workflow): SHARED_APP_TOKEN is
# read fresh from Vault through the Cloudflare Access tunnel, the VM is reached
# via its DNS name using OCI_VM_SSH_KEY (base64) from the Vault import. Local
# mode: gcloud + IAP for the token, terraform output for the IP, personal SSH key.
if [ -z "$VAULT_ADDR" ]; then
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

  OCI_VM_HOST=$(cd "${SCRIPT_DIR}/../.." && terraform output -raw oci_vm_public_ip)
  SSH_KEY_FILE="$HOME/.ssh/id_ed25519"
else
  echo "Fetching SHARED_APP_TOKEN from Vault..."
  SHARED_APP_TOKEN=$(curl -sf \
    -H "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" \
    -H "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}" \
    -H "X-Vault-Token: ${VAULT_TOKEN}" \
    "${VAULT_ADDR}/v1/${VAULT_KV_PATH}/data/secrets" \
    | jq -r '.data.data.SHARED_APP_TOKEN // empty')

  if [ -z "$OCI_VM_SSH_KEY" ]; then
    echo "ERROR: OCI_VM_SSH_KEY not available" >&2
    exit 1
  fi

  OCI_VM_HOST="$SOCKET_SERVER_HOST"
  SSH_KEY_FILE=$(mktemp)
  printf '%s' "$OCI_VM_SSH_KEY" | base64 -d > "$SSH_KEY_FILE"
  chmod 600 "$SSH_KEY_FILE"
fi

if [ -z "$SHARED_APP_TOKEN" ]; then
  echo "Failed to fetch SHARED_APP_TOKEN from Vault" >&2
  exit 1
fi

SSH_OPTS="-i $SSH_KEY_FILE -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"

ssh-keygen -R "$OCI_VM_HOST" >/dev/null 2>&1 || true

echo "Waiting for socket-server VM (${OCI_VM_HOST}) to be ready..."
for i in $(seq 1 30); do
  if ssh $SSH_OPTS "ubuntu@${OCI_VM_HOST}" 'test -f /opt/socket-server/docker-compose.yml && sudo docker info >/dev/null 2>&1' 2>/dev/null; then
    break
  fi
  sleep 10
done

echo "Updating SENDER_TOKEN on socket-server VM (${OCI_VM_HOST})..."
printf '%s' "$SHARED_APP_TOKEN" | ssh $SSH_OPTS "ubuntu@${OCI_VM_HOST}" '
NEW_TOKEN=$(cat)
sudo sed -i "s/SENDER_TOKEN: .*/SENDER_TOKEN: $NEW_TOKEN/" /opt/socket-server/docker-compose.yml
sudo docker compose -f /opt/socket-server/docker-compose.yml up -d
'
echo "SENDER_TOKEN synced with Vault."
