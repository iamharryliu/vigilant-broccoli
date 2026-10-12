#!/bin/bash
# Sourced by operator scripts that need a short-TTL Vault token instead of the
# root token. Callers must also source infrastructure/lib/ssh-secrets.sh.
#
# The AppRole credentials go over stdin (ssh-secrets.sh), and the remote login
# feeds them to `vault write auth/approle/login -` as JSON on stdin, so neither
# they nor the derived token ever appear in a command line / `ps` on the VM.

VAULT_OPS_ROLE_ID_SECRET="VB_VM_VAULT_OPS_ROLE_ID"
VAULT_OPS_SECRET_ID_SECRET="VB_VM_VAULT_OPS_SECRET_ID"

VAULT_OPS_LOGIN='set -e
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
VAULT_TOKEN=$(printf "{\"role_id\":\"%s\",\"secret_id\":\"%s\"}" "$VAULT_OPS_ROLE_ID" "$VAULT_OPS_SECRET_ID" | vault write -field=token auth/approle/login -)
[ -n "$VAULT_TOKEN" ] || { echo "vault-ops: AppRole login returned an empty token" >&2; exit 1; }
export VAULT_TOKEN
'

fetch_vault_ops_credentials() {
  VAULT_OPS_ROLE_ID=$(gcloud secrets versions access latest \
    --secret="${VAULT_OPS_ROLE_ID_SECRET}" \
    --project="${GCP_PROJECT}")
  VAULT_OPS_SECRET_ID=$(gcloud secrets versions access latest \
    --secret="${VAULT_OPS_SECRET_ID_SECRET}" \
    --project="${GCP_PROJECT}")
  if [ -z "$VAULT_OPS_ROLE_ID" ] || [ -z "$VAULT_OPS_SECRET_ID" ]; then
    echo "ERROR: ${VAULT_OPS_ROLE_ID_SECRET}/${VAULT_OPS_SECRET_ID_SECRET} empty in Secret Manager (run pnpm gcp:vm:post-init)" >&2
    return 1
  fi
}

# vault_ops_ssh SCRIPT [NAME VALUE]... — runs SCRIPT on the Vault VM after an
# AppRole login (with set -e), passing the credentials and any extra secrets
# over stdin. Requires fetch_vault_ops_credentials to have run.
vault_ops_ssh() {
  local script="$1"
  shift
  gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" "${VAULT_OPS_LOGIN}${script}" \
    VAULT_OPS_ROLE_ID "$VAULT_OPS_ROLE_ID" \
    VAULT_OPS_SECRET_ID "$VAULT_OPS_SECRET_ID" \
    "$@"
}

# require_value NAME VALUE — `$(remote | tr ...)` pipelines mask a failed
# remote; abort rather than continue with an empty secret.
require_value() {
  if [ -z "$2" ]; then
    echo "ERROR: failed to read $1 from Vault" >&2
    exit 1
  fi
}
