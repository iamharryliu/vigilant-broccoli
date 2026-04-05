#!/bin/bash
set -e

VM_NAME="vb-free-vm"
VM_ZONE="us-east1-b"
GITHUB_OWNER="iamharryliu"
GITHUB_REPO="vigilant-broccoli"
KV_PATH="kv"
POLICY_NAME="github-actions-policy"
ROLE_NAME="github-actions-role"
JWT_ISSUER="https://token.actions.githubusercontent.com"

if [ -z "${VAULT_TOKEN}" ]; then
  echo "ERROR: VAULT_TOKEN env var required (root token from 'vault operator init')"
  exit 1
fi

gcloud compute ssh "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --tunnel-through-iap \
  --command="
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_SKIP_VERIFY=true
export VAULT_TOKEN='${VAULT_TOKEN}'

echo 'Enabling KV v2 at ${KV_PATH}/...'
vault secrets enable -path=${KV_PATH} kv-v2 2>/dev/null || echo '  already enabled'

echo 'Enabling JWT auth...'
vault auth enable jwt 2>/dev/null || echo '  already enabled'

echo 'Configuring JWT auth for GitHub OIDC...'
vault write auth/jwt/config \
  bound_issuer=${JWT_ISSUER} \
  oidc_discovery_url=${JWT_ISSUER}

echo 'Writing policy ${POLICY_NAME}...'
vault policy write ${POLICY_NAME} - <<POLICY
path \"${KV_PATH}/data/secrets\" {
  capabilities = [\"read\"]
}
path \"${KV_PATH}/data/secrets/*\" {
  capabilities = [\"read\"]
}
path \"${KV_PATH}/data/test\" {
  capabilities = [\"read\"]
}
POLICY

echo 'Creating role ${ROLE_NAME}...'
vault write auth/jwt/role/${ROLE_NAME} - <<ROLE
{
  \"role_type\": \"jwt\",
  \"user_claim\": \"actor\",
  \"bound_claims_type\": \"glob\",
  \"bound_claims\": {
    \"repository\": \"${GITHUB_OWNER}/${GITHUB_REPO}\"
  },
  \"bound_audiences\": [\"https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}\"],
  \"policies\": [\"${POLICY_NAME}\"],
  \"ttl\": \"10m\"
}
ROLE

echo 'Creating kv/test placeholder...'
vault kv put ${KV_PATH}/test test=test

echo 'Done.'
"
