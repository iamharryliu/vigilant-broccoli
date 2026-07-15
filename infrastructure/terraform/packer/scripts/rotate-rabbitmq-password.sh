#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

RABBITMQ_USER="admin"
RABBITMQ_HOST="socket.harryliu.dev"
FLY_APPS=("staging-vb-email-service" "staging-email-subscription-service")

# CI mode (VAULT_ADDR set by the rotate-secrets workflow): the VM is reached via
# its DNS name using OCI_VM_SSH_KEY (base64) from the Vault import, Vault is
# patched through the Cloudflare Access tunnel. Local mode: personal SSH key,
# terraform output for the IP, gcloud + IAP for Vault.
if [ -z "$VAULT_ADDR" ]; then
  echo "Fetching root token from Secret Manager..."
  VAULT_TOKEN=$(gcloud secrets versions access latest \
    --secret=VB_VM_VAULT_ROOT_TOKEN \
    --project="${GCP_PROJECT}")

  RABBITMQ_IP=$(cd "${SCRIPT_DIR}/../../" && terraform output -raw oci_vm_public_ip)
  SSH_KEY_FILE="$HOME/.ssh/id_ed25519"
else
  if [ -z "$OCI_VM_SSH_KEY" ]; then
    echo "ERROR: OCI_VM_SSH_KEY not available" >&2
    exit 1
  fi

  RABBITMQ_IP="$RABBITMQ_HOST"
  SSH_KEY_FILE=$(mktemp)
  trap 'rm -f "$SSH_KEY_FILE"' EXIT
  # Trailing newline is required — OpenSSH/libcrypto reject a key without it,
  # which makes every ssh below fail silently and the readiness loop hang.
  { printf '%s' "$OCI_VM_SSH_KEY" | base64 -d; echo; } > "$SSH_KEY_FILE"
  chmod 600 "$SSH_KEY_FILE"
fi

SSH_OPTS="-i $SSH_KEY_FILE -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"
RABBITMQ_SSH="ubuntu@${RABBITMQ_IP}"

NEW_PASSWORD=$(openssl rand -hex 24)

echo "Setting new password on RabbitMQ VM (${RABBITMQ_IP})..."
ssh $SSH_OPTS "$RABBITMQ_SSH" "
sudo sed -i \"s/RABBITMQ_DEFAULT_PASS: .*/RABBITMQ_DEFAULT_PASS: ${NEW_PASSWORD}/\" /opt/rabbitmq/docker-compose.yml
sudo docker compose -f /opt/rabbitmq/docker-compose.yml up -d
"

# Connection string always uses the DNS name (RABBITMQ_IP is the SSH target,
# which is the raw IP in local mode) so it matches the broker cert's SAN and
# stays consistent with post-apply.sh — otherwise local rotations drift Vault
# to the IP form and break the TLS-verifying CI checks.
NEW_CONNECTION_STRING="amqps://${RABBITMQ_USER}:${NEW_PASSWORD}@${RABBITMQ_HOST}:5671"

echo "Waiting for RabbitMQ to finish starting..."
READY=false
for i in $(seq 1 30); do
  if ssh $SSH_OPTS "$RABBITMQ_SSH" "sudo docker exec rabbitmq rabbitmqctl status" >/dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 2
done

if [ "$READY" != true ]; then
  echo "ERROR: RabbitMQ did not come up after container recreate; old password left in Vault"
  exit 1
fi

echo "Verifying new credentials..."
if ! ssh $SSH_OPTS "$RABBITMQ_SSH" \
  "sudo docker exec rabbitmq rabbitmqctl authenticate_user ${RABBITMQ_USER} '${NEW_PASSWORD}'" >/dev/null; then
  echo "ERROR: New password failed verification; old password left in Vault"
  exit 1
fi

echo "Updating Vault with new connection string..."
if [ -z "$VAULT_ADDR" ]; then
  gcloud compute ssh "${VM_NAME}" \
    --zone="${GCP_ZONE}" \
    --tunnel-through-iap \
    --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${VAULT_TOKEN}'

vault kv patch ${VAULT_KV_PATH}/secrets RABBITMQ_CONNECTION_STRING='${NEW_CONNECTION_STRING}'
"
else
  curl -sf -o /dev/null \
    -H "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" \
    -H "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}" \
    -H "X-Vault-Token: ${VAULT_TOKEN}" \
    -X PATCH -H "Content-Type: application/merge-patch+json" \
    -d "{\"data\":{\"RABBITMQ_CONNECTION_STRING\":\"${NEW_CONNECTION_STRING}\"}}" \
    "${VAULT_ADDR}/v1/${VAULT_KV_PATH}/data/secrets"
fi

for FLY_APP in "${FLY_APPS[@]}"; do
  echo "Pushing new connection string to ${FLY_APP} (rolling restart)..."
  flyctl secrets set --app "${FLY_APP}" RABBITMQ_CONNECTION_STRING="${NEW_CONNECTION_STRING}"
done

echo "✓ RabbitMQ password rotated successfully"
