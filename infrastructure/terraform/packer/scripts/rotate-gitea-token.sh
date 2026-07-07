#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

GITEA_HOST="git.harryliu.dev"
GITEA_USER="iamharryliu"
GITEA_DB="/data/gitea/gitea.db"
SSH_OPTS="-i $HOME/.ssh/id_ed25519 -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"
TOKEN_PREFIX="vb-ci-"
TOKEN_NAME="${TOKEN_PREFIX}$(date +%Y%m%d%H%M%S)"
TOKEN_SCOPES="read:repository"

# The hostname is Cloudflare-proxied, so SSH must target the VM's real IP.
GITEA_IP=$(cd "${SCRIPT_DIR}/../../" && terraform output -raw oci_gitea_public_ip)
GITEA_SSH="ubuntu@${GITEA_IP}"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

# CF Access service token — the verify curl below hits the Access-gated hostname.
CF_ID=$(gcloud compute ssh "${VM_NAME}" --zone="${GCP_ZONE}" --tunnel-through-iap \
  --command="export VAULT_ADDR=https://127.0.0.1:8200 VAULT_CACERT=/etc/vault/tls/vault.crt VAULT_TOKEN='${VAULT_TOKEN}'; vault kv get -field=GITEA_CF_ACCESS_CLIENT_ID ${VAULT_KV_PATH}/secrets" 2>/dev/null | tr -d '[:space:]')
CF_SECRET=$(gcloud compute ssh "${VM_NAME}" --zone="${GCP_ZONE}" --tunnel-through-iap \
  --command="export VAULT_ADDR=https://127.0.0.1:8200 VAULT_CACERT=/etc/vault/tls/vault.crt VAULT_TOKEN='${VAULT_TOKEN}'; vault kv get -field=GITEA_CF_ACCESS_CLIENT_SECRET ${VAULT_KV_PATH}/secrets" 2>/dev/null | tr -d '[:space:]')

echo "Minting new Gitea token (${TOKEN_NAME}, scopes: ${TOKEN_SCOPES})..."
NEW_TOKEN=$(ssh $SSH_OPTS "$GITEA_SSH" \
  "sudo docker exec -u git gitea gitea admin user generate-access-token -u ${GITEA_USER} -t ${TOKEN_NAME} --scopes ${TOKEN_SCOPES} --raw" | tr -d '[:space:]')

if [ -z "$NEW_TOKEN" ]; then
  echo "ERROR: Failed to mint new Gitea token"
  exit 1
fi

echo "Verifying new token..."
if ! curl -sf -o /dev/null \
  -H "CF-Access-Client-Id: ${CF_ID}" \
  -H "CF-Access-Client-Secret: ${CF_SECRET}" \
  -H "Authorization: token ${NEW_TOKEN}" \
  "https://${GITEA_HOST}/api/v1/repos/${GITEA_USER}/journal"; then
  echo "ERROR: New token failed verification; old tokens left untouched"
  exit 1
fi

echo "Updating Vault with new token..."
gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${VAULT_TOKEN}'

vault kv patch ${VAULT_KV_PATH}/secrets GITEA_TOKEN='${NEW_TOKEN}'
"

echo "Revoking previous ${TOKEN_PREFIX}* tokens..."
ssh $SSH_OPTS "$GITEA_SSH" \
  "sudo docker exec -u git gitea sqlite3 ${GITEA_DB} \"DELETE FROM access_token WHERE name LIKE '${TOKEN_PREFIX}%' AND name != '${TOKEN_NAME}'\""

UNMANAGED=$(ssh $SSH_OPTS "$GITEA_SSH" \
  "sudo docker exec -u git gitea sqlite3 ${GITEA_DB} \"SELECT name FROM access_token WHERE name NOT LIKE '${TOKEN_PREFIX}%'\"")
if [ -n "$UNMANAGED" ]; then
  echo "⚠ Unmanaged Gitea tokens left in place (review in Gitea UI → Settings → Applications): ${UNMANAGED}"
fi

echo "✓ Gitea token rotated successfully"
