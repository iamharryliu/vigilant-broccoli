#!/bin/bash

export GCP_PROJECT="vigilant-broccoli"
export GCP_REGION="us-central1"
export GCP_ZONE="us-central1-a"

export GITHUB_OWNER="iamharryliu"
export GITHUB_REPO="vigilant-broccoli"

export VM_NAME="vb-free-vm"
export VM_IMAGE_FAMILY="vb-vm"

export VAULT_KV_PATH="kv"
export VAULT_POLICY_NAME="github-actions-policy"
export VAULT_ROLE_NAME="github-actions-role"
export VAULT_ROTATE_POLICY_NAME="github-actions-rotate-policy"
export VAULT_ROTATE_ROLE_NAME="github-actions-rotate-role"
export VAULT_JWT_ISSUER="https://token.actions.githubusercontent.com"

# AppRole used by operator scripts (run-vault-*.sh, rotate-*.sh, post-apply.sh)
# so routine operations mint short-TTL tokens instead of using the
# never-expiring root token.
export VAULT_OPS_POLICY_NAME="vb-ops-policy"
export VAULT_OPS_ROLE_NAME="vb-ops-role"
