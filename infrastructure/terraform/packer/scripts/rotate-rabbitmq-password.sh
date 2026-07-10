#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

RABBITMQ_USER="admin"
FLY_APPS=("vb-email-service" "email-subscription-service")
SSH_OPTS="-i $HOME/.ssh/id_ed25519 -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"

RABBITMQ_IP=$(cd "${SCRIPT_DIR}/../../" && terraform output -raw oci_vm_public_ip)
RABBITMQ_SSH="ubuntu@${RABBITMQ_IP}"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

NEW_PASSWORD=$(openssl rand -hex 24)

echo "Setting new password on RabbitMQ VM (${RABBITMQ_IP})..."
ssh $SSH_OPTS "$RABBITMQ_SSH" "
sudo docker exec rabbitmq rabbitmqctl change_password ${RABBITMQ_USER} '${NEW_PASSWORD}'
sudo sed -i \"s/RABBITMQ_DEFAULT_PASS: .*/RABBITMQ_DEFAULT_PASS: ${NEW_PASSWORD}/\" /opt/rabbitmq/docker-compose.yml
"

NEW_CONNECTION_STRING="amqps://${RABBITMQ_USER}:${NEW_PASSWORD}@${RABBITMQ_IP}:5671"

echo "Verifying new credentials..."
if ! ssh $SSH_OPTS "$RABBITMQ_SSH" \
  "sudo docker exec rabbitmq rabbitmqctl authenticate_user ${RABBITMQ_USER} '${NEW_PASSWORD}'" >/dev/null; then
  echo "ERROR: New password failed verification; old password left in Vault"
  exit 1
fi

echo "Updating Vault with new connection string..."
gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${VAULT_TOKEN}'

vault kv patch ${VAULT_KV_PATH}/secrets RABBITMQ_CONNECTION_STRING='${NEW_CONNECTION_STRING}'
"

for FLY_APP in "${FLY_APPS[@]}"; do
  echo "Pushing new connection string to ${FLY_APP} (rolling restart)..."
  flyctl secrets set --app "${FLY_APP}" RABBITMQ_CONNECTION_STRING="${NEW_CONNECTION_STRING}"
done

echo "✓ RabbitMQ password rotated successfully"
