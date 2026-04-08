#!/bin/bash
set -e

GCP_PROJECT="vigilant-broccoli"
VAULT_KV_PATH="kv"
VM_NAME="vb-free-vm"
VM_ZONE="us-east1-b"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Revoking all vb-deploy-token entries..."
fly tokens list --scope org --org personal | grep "vb-deploy-token" | grep -v "REVOKED" | awk '{print $1}' | while read TOKEN_ID; do
  if [ -n "$TOKEN_ID" ]; then
    echo "Revoking token (ID: $TOKEN_ID)..."
    fly tokens revoke "$TOKEN_ID" 2>/dev/null || true
  fi
done
echo "✓ All vb-deploy-token entries revoked"

echo "Creating new Fly.io organization token..."
NEW_TOKEN=$(fly tokens create org -n vb-deploy-token -o personal 2>&1 | grep "FlyV1" | awk '{print $NF}')

if [ -z "$NEW_TOKEN" ]; then
  echo "ERROR: Failed to create new Fly.io token"
  exit 1
fi

echo "Updating Vault with new token..."
gcloud compute ssh "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_SKIP_VERIFY=true
export VAULT_TOKEN='${VAULT_TOKEN}'

vault kv patch ${VAULT_KV_PATH}/secrets FLY_API_TOKEN='${NEW_TOKEN}'
"

echo "✓ Fly.io token rotated successfully"
