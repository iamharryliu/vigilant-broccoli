#!/bin/bash
# Writes one Vault secret: ./save-vault-secret.sh KEY < value-on-stdin
#
# `vault kv patch` on purpose, never `kv put`: put replaces the entire secret
# map, and run-vault-set-secrets.sh builds that put by eval-ing a shell string
# assembled from JSON — values holding a newline, quote or $ do not survive
# the round trip. Adding one key is not worth rewriting the other sixty-eight.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"
source "${SCRIPT_DIR}/../lib/ssh-secrets.sh"

VAULT_KEY="${1:-}"
if [ -z "$VAULT_KEY" ]; then
  echo "Usage: $(basename "$0") VAULT_KEY < value" >&2
  exit 1
fi

# Read from stdin rather than $2 so the value is never in this process's argv,
# which is world-readable through ps.
SECRET_VALUE=$(cat)
if [ -z "$SECRET_VALUE" ]; then
  echo "ERROR: no value on stdin for ${VAULT_KEY}." >&2
  exit 1
fi

echo "Fetching root token from Secret Manager..." >&2
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Patching ${VAULT_KEY} into ${VAULT_KV_PATH}/secrets..." >&2
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

# The payload goes through a file in tmpfs, and jq reads the value from the
# environment rather than an --arg, so the secret stays out of argv on the VM
# too. jq also does the JSON escaping a hand-built string would get wrong.
# /dev/shm rather than /run: both are tmpfs, so the value never reaches the
# disk, but /run is root-only and this connects as an ordinary user.
PATCH_FILE=$(mktemp /dev/shm/vault-patch.XXXXXX.json)
trap "rm -f \"$PATCH_FILE\"" EXIT
jq -n --arg k "$VAULT_KEY" "{(\$k): env.SECRET_VALUE}" > "$PATCH_FILE"

vault kv patch '"${VAULT_KV_PATH}"'/secrets @"$PATCH_FILE" > /dev/null
echo "patched"
' VAULT_TOKEN "$VAULT_TOKEN" VAULT_KEY "$VAULT_KEY" SECRET_VALUE "$SECRET_VALUE"

echo "✓ ${VAULT_KEY} saved to Vault" >&2
