#!/bin/bash
set -e

VAULT_ADDR_DEFAULT="https://127.0.0.1:8200"
GITHUB_OWNER="iamharryliu"
GITHUB_REPO="vigilant-broccoli"
KV_PATH="kv"
POLICY_NAME="github-actions-policy"
ROLE_NAME="github-actions-role"
JWT_ISSUER="https://token.actions.githubusercontent.com"

export VAULT_ADDR="${VAULT_ADDR:-${VAULT_ADDR_DEFAULT}}"
export VAULT_SKIP_VERIFY="${VAULT_SKIP_VERIFY:-true}"

if [ -z "${VAULT_TOKEN}" ]; then
  echo "ERROR: VAULT_TOKEN env var required (use root token from 'vault operator init')"
  exit 1
fi

echo "Enabling KV v2 at ${KV_PATH}/..."
vault secrets enable -path=${KV_PATH} kv-v2 2>/dev/null || echo "  already enabled"

echo "Enabling JWT auth..."
vault auth enable jwt 2>/dev/null || echo "  already enabled"

echo "Configuring JWT auth for GitHub OIDC..."
vault write auth/jwt/config \
  bound_issuer="${JWT_ISSUER}" \
  oidc_discovery_url="${JWT_ISSUER}"

echo "Writing policy ${POLICY_NAME}..."
vault policy write ${POLICY_NAME} - <<EOF
path "${KV_PATH}/data/secrets" {
  capabilities = ["read"]
}
path "${KV_PATH}/data/secrets/*" {
  capabilities = ["read"]
}
path "${KV_PATH}/data/test" {
  capabilities = ["read"]
}
EOF

echo "Creating role ${ROLE_NAME}..."
vault write auth/jwt/role/${ROLE_NAME} - <<EOF
{
  "role_type": "jwt",
  "user_claim": "actor",
  "bound_claims_type": "glob",
  "bound_claims": {
    "repository": "${GITHUB_OWNER}/${GITHUB_REPO}"
  },
  "bound_audiences": ["https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}"],
  "policies": ["${POLICY_NAME}"],
  "ttl": "10m"
}
EOF

echo "Creating kv/test placeholder..."
vault kv put ${KV_PATH}/test test=test

echo ""
echo "Done. Populate secrets with:"
echo "  vault kv put ${KV_PATH}/secrets KEY=VALUE ..."
