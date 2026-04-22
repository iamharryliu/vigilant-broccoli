#!/bin/bash
set -e

VM_NAME="vb-free-vm"
VM_ZONE="us-east1-b"
GCP_PROJECT="vigilant-broccoli"
GITHUB_OWNER="iamharryliu"
GITHUB_REPO="vigilant-broccoli"
KV_PATH="kv"
POLICY_NAME="github-actions-policy"
ROLE_NAME="github-actions-role"
JWT_ISSUER="https://token.actions.githubusercontent.com"

INIT_OUTPUT=$(gcloud compute ssh "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

if vault status 2>&1 | grep -q 'Initialized.*true'; then
  echo 'ALREADY_INITIALIZED'
else
  vault operator init -recovery-shares=5 -recovery-threshold=3
fi
")

if echo "$INIT_OUTPUT" | grep -q "ALREADY_INITIALIZED"; then
  echo "Vault already initialized."
  if [ -z "${VAULT_TOKEN}" ]; then
    echo "Fetching root token from Secret Manager..."
    VAULT_TOKEN=$(gcloud secrets versions access latest \
      --secret=VB_VM_VAULT_ROOT_TOKEN \
      --project="${GCP_PROJECT}")
  fi
else
  echo "Vault initialized. Saving recovery keys and root token to Secret Manager..."

  RECOVERY_KEYS=$(echo "$INIT_OUTPUT" | grep "Recovery Key" | awk '{print $NF}')
  ROOT_TOKEN=$(echo "$INIT_OUTPUT" | grep "Initial Root Token" | awk '{print $NF}')

  echo -n "$RECOVERY_KEYS" | gcloud secrets versions add VB_VM_VAULT_UNSEAL_KEYS \
    --data-file=- --project="${GCP_PROJECT}"
  echo -n "$ROOT_TOKEN" | gcloud secrets versions add VB_VM_VAULT_ROOT_TOKEN \
    --data-file=- --project="${GCP_PROJECT}"

  echo "Recovery keys and root token saved to Secret Manager."
  VAULT_TOKEN="$ROOT_TOKEN"
fi

echo "Waiting for Vault auto-unseal..."
gcloud compute ssh "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

for i in 1 2 3 4 5; do
  if vault status 2>&1 | grep -q 'Sealed.*false'; then
    echo 'Vault is unsealed.'
    exit 0
  fi
  sleep 2
done
echo 'ERROR: Vault is still sealed after waiting.'
exit 1
"

echo "Configuring Vault..."
gcloud compute ssh "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --tunnel-through-iap \
  --command="
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
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
