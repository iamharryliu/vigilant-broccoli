#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

TF_API="https://app.terraform.io/api/v2"
TOKEN_PREFIX="vb-ci-"
TOKEN_DESCRIPTION="${TOKEN_PREFIX}$(date +%Y%m%d%H%M%S)"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Reading current TF Cloud token from Vault..."
OLD_TOKEN=$(gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv get -field=TF_CLOUD_TOKEN '"${VAULT_KV_PATH}"'/secrets
' VAULT_TOKEN "$VAULT_TOKEN" 2>/dev/null | tr -d '[:space:]')

if [ -z "$OLD_TOKEN" ]; then
  echo "ERROR: Failed to read current TF_CLOUD_TOKEN from Vault"
  exit 1
fi

echo "Resolving account id..."
USER_ID=$(curl -sf -H "Authorization: Bearer ${OLD_TOKEN}" "${TF_API}/account/details" | jq -r '.data.id // empty')

if [ -z "$USER_ID" ]; then
  echo "ERROR: Failed to resolve account id from current token"
  exit 1
fi

# Only tokens this script minted (description prefixed ${TOKEN_PREFIX}) are
# ever revoked automatically — the account also holds a personal token from
# `terraform login` for local tf:* commands, which must never be touched here.
echo "Listing existing tokens..."
TOKENS=$(curl -sf -H "Authorization: Bearer ${OLD_TOKEN}" "${TF_API}/users/${USER_ID}/authentication-tokens")
MANAGED_TOKEN_IDS=$(jq -r --arg prefix "$TOKEN_PREFIX" '.data[] | select(.attributes.description | startswith($prefix)) | .id' <<< "$TOKENS")
UNMANAGED=$(jq -r --arg prefix "$TOKEN_PREFIX" '.data[] | select(.attributes.description | startswith($prefix) | not) | .attributes.description' <<< "$TOKENS")

echo "Creating new HCP Terraform user token (${TOKEN_DESCRIPTION})..."
CREATE=$(curl -sf -X POST \
  -H "Authorization: Bearer ${OLD_TOKEN}" \
  -H "Content-Type: application/vnd.api+json" \
  -d "{\"data\":{\"type\":\"authentication-tokens\",\"attributes\":{\"description\":\"${TOKEN_DESCRIPTION}\"}}}" \
  "${TF_API}/users/${USER_ID}/authentication-tokens")
NEW_TOKEN=$(jq -r '.data.attributes.token // empty' <<< "$CREATE")

if [ -z "$NEW_TOKEN" ]; then
  echo "ERROR: Failed to create new HCP Terraform token"
  exit 1
fi

echo "Verifying new token..."
if ! curl -sf -o /dev/null -H "Authorization: Bearer ${NEW_TOKEN}" "${TF_API}/account/details"; then
  echo "ERROR: New token failed verification; old tokens left untouched"
  exit 1
fi

echo "Updating Vault with new token..."
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv patch '"${VAULT_KV_PATH}"'/secrets TF_CLOUD_TOKEN="$NEW_TOKEN"
' VAULT_TOKEN "$VAULT_TOKEN" NEW_TOKEN "$NEW_TOKEN"

echo "Revoking previous ${TOKEN_PREFIX}* tokens..."
for TOKEN_ID in $MANAGED_TOKEN_IDS; do
  echo "Revoking token (ID: ${TOKEN_ID})..."
  curl -sf -X DELETE -H "Authorization: Bearer ${NEW_TOKEN}" "${TF_API}/authentication-tokens/${TOKEN_ID}"
done

if [ -n "$UNMANAGED" ]; then
  echo "⚠ Unmanaged HCP Terraform tokens left in place (review at https://app.terraform.io/app/settings/tokens): ${UNMANAGED}"
fi

echo "✓ HCP Terraform token rotated successfully"
