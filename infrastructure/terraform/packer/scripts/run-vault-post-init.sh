#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

INIT_OUTPUT=$(gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
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

# The root token is only ever used here, to bootstrap auth methods/policies/roles,
# and in revoke-vault-root-token.sh. It's piped over stdin rather than
# interpolated into --command so it never appears in `ps` on the VM.
echo "Configuring Vault..."
printf '%s' "$VAULT_TOKEN" | gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
VAULT_TOKEN=\$(cat)
export VAULT_TOKEN

echo 'Enabling KV v2 at ${VAULT_KV_PATH}/...'
vault secrets enable -path=${VAULT_KV_PATH} kv-v2 2>/dev/null || echo '  already enabled'

echo 'Enabling JWT auth...'
vault auth enable jwt 2>/dev/null || echo '  already enabled'

echo 'Configuring JWT auth for GitHub OIDC...'
vault write auth/jwt/config \
  bound_issuer=${VAULT_JWT_ISSUER} \
  oidc_discovery_url=${VAULT_JWT_ISSUER}

echo 'Writing policy ${VAULT_POLICY_NAME}...'
vault policy write ${VAULT_POLICY_NAME} - <<POLICY
path \"${VAULT_KV_PATH}/data/secrets\" {
  capabilities = [\"read\"]
}
path \"${VAULT_KV_PATH}/data/secrets/*\" {
  capabilities = [\"read\"]
}
path \"${VAULT_KV_PATH}/data/test\" {
  capabilities = [\"read\"]
}
POLICY

echo 'Writing policy ${VAULT_ROTATE_POLICY_NAME}...'
vault policy write ${VAULT_ROTATE_POLICY_NAME} - <<POLICY
path \"${VAULT_KV_PATH}/data/secrets\" {
  capabilities = [\"read\", \"update\", \"patch\"]
}
path \"${VAULT_KV_PATH}/data/test\" {
  capabilities = [\"read\"]
}
POLICY

echo 'Writing policy ${VAULT_OPS_POLICY_NAME}...'
vault policy write ${VAULT_OPS_POLICY_NAME} - <<POLICY
path \"${VAULT_KV_PATH}/data/secrets\" {
  capabilities = [\"read\", \"create\", \"update\", \"patch\"]
}
path \"${VAULT_KV_PATH}/data/secrets/*\" {
  capabilities = [\"read\", \"create\", \"update\", \"patch\"]
}
path \"sys/seal\" {
  capabilities = [\"update\", \"sudo\"]
}
POLICY

echo 'Creating role ${VAULT_ROLE_NAME}...'
vault write auth/jwt/role/${VAULT_ROLE_NAME} - <<ROLE
{
  \"role_type\": \"jwt\",
  \"user_claim\": \"actor\",
  \"bound_claims_type\": \"glob\",
  \"bound_claims\": {
    \"repository\": \"${GITHUB_OWNER}/${GITHUB_REPO}\"
  },
  \"bound_audiences\": [\"https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}\"],
  \"policies\": [\"${VAULT_POLICY_NAME}\"],
  \"ttl\": \"30m\"
}
ROLE

echo 'Creating role ${VAULT_ROTATE_ROLE_NAME}...'
vault write auth/jwt/role/${VAULT_ROTATE_ROLE_NAME} - <<ROLE
{
  \"role_type\": \"jwt\",
  \"user_claim\": \"actor\",
  \"bound_claims_type\": \"glob\",
  \"bound_claims\": {
    \"repository\": \"${GITHUB_OWNER}/${GITHUB_REPO}\",
    \"job_workflow_ref\": \"${GITHUB_OWNER}/${GITHUB_REPO}/.github/workflows/ci-rotate-secrets.yml@*\"
  },
  \"bound_audiences\": [\"https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}\"],
  \"policies\": [\"${VAULT_ROTATE_POLICY_NAME}\"],
  \"ttl\": \"30m\"
}
ROLE

echo 'Enabling AppRole auth...'
vault auth enable approle 2>/dev/null || echo '  already enabled'

echo 'Creating AppRole ${VAULT_OPS_ROLE_NAME}...'
vault write auth/approle/role/${VAULT_OPS_ROLE_NAME} \
  token_policies=${VAULT_OPS_POLICY_NAME} \
  token_ttl=15m \
  token_max_ttl=30m \
  secret_id_ttl=90d

echo 'Creating kv/test placeholder...'
vault kv put ${VAULT_KV_PATH}/test test=test

echo 'Done.'
"

# role_id is not sensitive (Vault's AppRole design treats it like a username),
# but it's still piped over stdin alongside VAULT_TOKEN for consistency and to
# keep this call identical in shape to the rest of the ops-token plumbing.
echo "Fetching AppRole role_id for ${VAULT_OPS_ROLE_NAME}..."
OPS_ROLE_ID=$(printf '%s' "$VAULT_TOKEN" | gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
VAULT_TOKEN=\$(cat)
export VAULT_TOKEN

vault read -field=role_id auth/approle/role/${VAULT_OPS_ROLE_NAME}/role-id
" 2>/dev/null | tr -d '[:space:]')

echo -n "$OPS_ROLE_ID" | gcloud secrets versions add VB_VM_VAULT_OPS_ROLE_ID \
  --data-file=- --project="${GCP_PROJECT}"

if gcloud secrets versions list VB_VM_VAULT_OPS_SECRET_ID --project="${GCP_PROJECT}" \
  --format="value(name)" 2>/dev/null | grep -q .; then
  echo "AppRole secret_id already present in Secret Manager — leaving it in place."
else
  echo "Generating AppRole secret_id for ${VAULT_OPS_ROLE_NAME}..."
  OPS_SECRET_ID=$(printf '%s' "$VAULT_TOKEN" | gcloud compute ssh "${VM_NAME}" \
    --zone="${GCP_ZONE}" \
    --tunnel-through-iap \
    --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
VAULT_TOKEN=\$(cat)
export VAULT_TOKEN

vault write -f -field=secret_id auth/approle/role/${VAULT_OPS_ROLE_NAME}/secret-id
" 2>/dev/null | tr -d '[:space:]')

  echo -n "$OPS_SECRET_ID" | gcloud secrets versions add VB_VM_VAULT_OPS_SECRET_ID \
    --data-file=- --project="${GCP_PROJECT}"
  echo "AppRole role_id/secret_id saved to Secret Manager."
fi

echo "Operator scripts now authenticate via ${VAULT_OPS_ROLE_NAME} instead of the root token."
echo "Once you've verified them, run ./revoke-vault-root-token.sh to revoke the root token (recovery keys stay valid)."
