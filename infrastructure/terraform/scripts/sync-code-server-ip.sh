#!/bin/bash
set -e

# Replacing the code-server VM gives it a fresh ephemeral IP; Terraform updates
# its DNS record in the apply, but Vault's CODE_SERVER_VM_IP (used by
# test-security-cloudflare-access.yml as the origin IP) is not in state. This
# patches just that key — the narrow local counterpart to the sync step in
# manual-replace-code-server.yml, without the unrelated reconciliation that the
# full post-apply.sh does (vault post-init, RabbitMQ/socket/gitea sync).

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../config.sh"
source "${SCRIPT_DIR}/../../lib/ssh-secrets.sh"
source "${SCRIPT_DIR}/../packer/scripts/lib/vault-ops-token.sh"

CODE_SERVER_IP=$(cd "${SCRIPT_DIR}/.." && terraform output -raw oci_code_server_public_ip)

echo "Fetching vb-ops AppRole credentials from Secret Manager..."
fetch_vault_ops_credentials

echo "Patching CODE_SERVER_VM_IP=${CODE_SERVER_IP} into Vault..."
vault_ops_ssh '
vault kv patch '"${VAULT_KV_PATH}"'/secrets CODE_SERVER_VM_IP="$CODE_SERVER_VM_IP"
' CODE_SERVER_VM_IP "$CODE_SERVER_IP"

echo "✓ Synced CODE_SERVER_VM_IP to Vault"
