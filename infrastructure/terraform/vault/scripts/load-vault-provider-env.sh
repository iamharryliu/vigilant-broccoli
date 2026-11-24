#!/bin/bash
# Prints export lines for the vault provider (eval the output), read from GCP
# Secret Manager like load-vault-tf-env.sh: there is no Bitwarden fallback,
# since planning Vault's configuration needs Vault reachable anyway.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

gcp_secret() {
  gcloud secrets versions access latest --secret="$1" --project="${GCP_PROJECT}"
}

printf 'export VAULT_ADDR=%q\n' "https://vault.vigilant-broccoli.app"
printf 'export VAULT_TOKEN=%q\n' "$(gcp_secret VB_VM_VAULT_ROOT_TOKEN)"
printf 'export TF_VAR_cf_access_client_id=%q\n' "$(gcp_secret VAULT_CF_ACCESS_CLIENT_ID)"
printf 'export TF_VAR_cf_access_client_secret=%q\n' "$(gcp_secret VAULT_CF_ACCESS_CLIENT_SECRET)"
