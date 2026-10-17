#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/lib/vault-ops-token.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

fetch_vault_ops_credentials

echo "Sealing Vault..."
vault_ops_ssh '
vault operator seal

if vault status 2>&1 | grep -q "Sealed.*true"; then
  echo "Vault sealed successfully."
else
  echo "ERROR: Vault is still unsealed."
  exit 1
fi
'
