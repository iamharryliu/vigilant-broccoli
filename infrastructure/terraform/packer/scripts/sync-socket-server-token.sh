#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

SOCKET_SERVER_HOST="socket.harryliu.dev"
SOCKET_SERVER_COMPOSE_FILE="/opt/socket-server/docker-compose.yml"

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
  SHARED_APP_TOKEN=$(gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv get -field=SHARED_APP_TOKEN '"${VAULT_KV_PATH}"'/secrets
' VAULT_TOKEN "$VAULT_TOKEN" | tr -d '[:space:]')

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
  trap 'rm -f "$SSH_KEY_FILE"' EXIT
  # Trailing newline is required — OpenSSH/libcrypto reject a key without it,
  # which makes every ssh below fail silently and the readiness loop hang.
  { printf '%s' "$OCI_VM_SSH_KEY" | base64 -d; echo; } > "$SSH_KEY_FILE"
  chmod 600 "$SSH_KEY_FILE"
fi

if [ -z "$SHARED_APP_TOKEN" ]; then
  echo "Failed to fetch SHARED_APP_TOKEN from Vault" >&2
  exit 1
fi

SSH_OPTS="-i $SSH_KEY_FILE -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"

ssh-keygen -R "$OCI_VM_HOST" >/dev/null 2>&1 || true

# Gate on cloud-init being done, not just on the compose file existing: the file
# and a running dockerd both predate cloud-init's own `docker compose up -d`, so
# a weaker probe races it into the same project. See docs/nuance.md.
CLOUD_INIT_DONE_PATTERN='^status: (done|degraded done)'
READY_ATTEMPTS=60
READY_SLEEP_SECONDS=10

echo "Waiting for cloud-init to finish on socket-server VM (${OCI_VM_HOST})..."
READY=false
for i in $(seq 1 $READY_ATTEMPTS); do
  if ssh $SSH_OPTS "ubuntu@${OCI_VM_HOST}" "
      sudo cloud-init status 2>/dev/null | grep -qE '${CLOUD_INIT_DONE_PATTERN}' \
        && test -f ${SOCKET_SERVER_COMPOSE_FILE} \
        && sudo docker info >/dev/null 2>&1" 2>/dev/null; then
    READY=true
    break
  fi
  sleep $READY_SLEEP_SECONDS
done

if [ "$READY" != true ]; then
  echo "socket-server VM (${OCI_VM_HOST}) not ready after $((READY_ATTEMPTS * READY_SLEEP_SECONDS / 60))m — cloud-init status:" >&2
  ssh $SSH_OPTS "ubuntu@${OCI_VM_HOST}" "
    sudo cloud-init status --long 2>&1
    test -f ${SOCKET_SERVER_COMPOSE_FILE} || echo 'compose file missing'
    sudo docker info >/dev/null 2>&1 || echo 'docker not ready'" >&2 || true
  exit 1
fi

echo "Updating SENDER_TOKEN on socket-server VM (${OCI_VM_HOST})..."
printf '%s' "$SHARED_APP_TOKEN" | ssh $SSH_OPTS "ubuntu@${OCI_VM_HOST}" '
COMPOSE_FILE='"${SOCKET_SERVER_COMPOSE_FILE}"'
NEW_TOKEN=$(cat)
sudo sed -i "s/SENDER_TOKEN: .*/SENDER_TOKEN: $NEW_TOKEN/" "$COMPOSE_FILE"
sudo docker compose -f "$COMPOSE_FILE" up -d
'
echo "SENDER_TOKEN synced with Vault."
