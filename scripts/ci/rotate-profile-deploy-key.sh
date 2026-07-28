#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../infrastructure/config.sh"
source "${SCRIPT_DIR}/../../infrastructure/lib/ssh-secrets.sh"

PROFILE_REPO="iamharryliu/iamharryliu"
KEY_TITLE="vigilant-broccoli profile sync"

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Capturing current deploy key IDs..."
OLD_KEY_IDS=$(gh api "repos/${PROFILE_REPO}/keys" --jq '.[].id')

KEY_DIR=$(mktemp -d)
trap 'rm -rf "$KEY_DIR"' EXIT

echo "Generating new deploy key..."
ssh-keygen -t ed25519 -N "" -C "$KEY_TITLE" -f "${KEY_DIR}/key" -q

echo "Adding new deploy key to ${PROFILE_REPO}..."
gh api -X POST "repos/${PROFILE_REPO}/keys" \
  -f title="$KEY_TITLE" \
  -f key="$(cat "${KEY_DIR}/key.pub")" \
  -F read_only=false > /dev/null

echo "Verifying new key against GitHub..."
if ! GIT_SSH_COMMAND="ssh -i ${KEY_DIR}/key -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new" \
  git ls-remote "git@github.com:${PROFILE_REPO}.git" HEAD > /dev/null; then
  echo "ERROR: New deploy key failed verification; old keys left untouched"
  exit 1
fi

echo "Updating Vault with new deploy key..."
NEW_KEY=$(cat "${KEY_DIR}/key")
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv patch '"${VAULT_KV_PATH}"'/secrets PROFILE_REPO_DEPLOY_KEY="$NEW_KEY"
' VAULT_TOKEN "$VAULT_TOKEN" NEW_KEY "$NEW_KEY"

echo "Revoking previous deploy keys..."
for KEY_ID in $OLD_KEY_IDS; do
  echo "Deleting deploy key (ID: ${KEY_ID})..."
  gh api -X DELETE "repos/${PROFILE_REPO}/keys/${KEY_ID}"
done

echo "✓ Profile repo deploy key rotated successfully"
