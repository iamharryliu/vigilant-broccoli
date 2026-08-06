#!/bin/bash
# Sourced by operator scripts that need a short-TTL Vault token instead of the
# never-expiring root token. Fetches the vb-ops AppRole credentials from
# Secret Manager into $VAULT_OPS_ROLE_ID / $VAULT_OPS_SECRET_ID.
#
# Callers pipe both values over stdin into their gcloud compute ssh --command,
# where the remote script logs in via `vault write auth/approle/login` and
# uses the resulting token locally to that ssh session — the AppRole
# credentials and the derived token never appear in a command line, so they
# don't show up in `ps` on the VM.

fetch_vault_ops_credentials() {
  VAULT_OPS_ROLE_ID=$(gcloud secrets versions access latest \
    --secret=VB_VM_VAULT_OPS_ROLE_ID \
    --project="${GCP_PROJECT}")
  VAULT_OPS_SECRET_ID=$(gcloud secrets versions access latest \
    --secret=VB_VM_VAULT_OPS_SECRET_ID \
    --project="${GCP_PROJECT}")
}
