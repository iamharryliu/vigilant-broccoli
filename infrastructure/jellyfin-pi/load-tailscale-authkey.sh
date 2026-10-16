#!/bin/bash
# Fetches the reusable Tailscale auth key from Vault and emits it as
# TS_AUTHKEY — same Vault-over-IAP path as load-env-from-vault.sh, and like it,
# nothing is written to disk. Source it, or `eval "$(load-tailscale-authkey.sh)"`.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../config.sh"
source "${SCRIPT_DIR}/../lib/ssh-secrets.sh"
source "${SCRIPT_DIR}/../terraform/packer/scripts/lib/vault-ops-token.sh"

VAULT_KEY="TAILSCALE_AUTH_KEY"

SOURCED=0
[[ "${BASH_SOURCE[0]}" != "${0}" ]] && SOURCED=1

echo "Fetching vb-ops AppRole credentials from Secret Manager..." >&2
fetch_vault_ops_credentials

echo "Fetching ${VAULT_KEY} from Vault..." >&2
TS_AUTHKEY=$(vault_ops_ssh '
vault kv get -format=json '"${VAULT_KV_PATH}"'/secrets | jq -r ".data.data.'"${VAULT_KEY}"' // empty"
')

if [ -z "$TS_AUTHKEY" ]; then
  echo "ERROR: ${VAULT_KEY} not found in Vault (${VAULT_KV_PATH}/secrets). Mint a reusable, pre-approved auth key in the Tailscale admin console and store it with: vault kv patch ${VAULT_KV_PATH}/secrets ${VAULT_KEY}=tskey-auth-..." >&2
  exit 1
fi

if [ "$SOURCED" = "1" ]; then
  export TS_AUTHKEY
else
  printf "export TS_AUTHKEY='%s'\n" "$(printf '%s' "$TS_AUTHKEY" | sed "s/'/'\\\\''/g")"
fi

echo "✓ Loaded ${VAULT_KEY} (session only — nothing written to disk)" >&2
