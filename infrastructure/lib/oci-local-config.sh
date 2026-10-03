#!/bin/bash
#
# Refreshes this machine's ~/.oci credentials from the values Vault holds.
# Terraform's oci provider reads them straight off disk (main.tf's
# `config_file_profile = "DEFAULT"`), and unlike every other provider they are
# not exported into the environment by load-vault-tf-env.sh — so after a
# rotation the local files name a fingerprint OCI has already deleted, and
# every `tf:*` command fails with a 401 until they are refreshed.

OCI_LOCAL_CONFIG_FILE="${HOME}/.oci/config"
OCI_LOCAL_KEY_FILE="${HOME}/.ssh/oci_api_key.pem"

# write_oci_local_config CONFIG PRIVATE_KEY
write_oci_local_config() {
  local config="$1" private_key="$2"

  # Refreshing an operator's existing credentials is the point; creating them
  # would plant a tenancy-admin key on whatever host happened to run this.
  if [ -n "$CI" ] || [ ! -f "${OCI_LOCAL_CONFIG_FILE}" ]; then
    return 0
  fi

  local config_tmp="${OCI_LOCAL_CONFIG_FILE}.tmp.$$"
  local key_tmp="${OCI_LOCAL_KEY_FILE}.tmp.$$"

  # Vault's copy points key_file at the path the CI workflows use; locally the
  # key lives under ~/.ssh.
  (umask 077 && printf '%s\n' "$private_key" > "${key_tmp}")
  (umask 077 && sed "s|^\([[:space:]]*key_file[[:space:]]*=\).*|\1${OCI_LOCAL_KEY_FILE}|" <<< "$config" > "${config_tmp}")
  if ! grep -q "^[[:space:]]*key_file" "${config_tmp}"; then
    printf 'key_file=%s\n' "${OCI_LOCAL_KEY_FILE}" >> "${config_tmp}"
  fi

  # main.tf regexes the tenancy OCID out of the config on every plan, so it must
  # never be observed half-written — stage both files, then rename into place.
  mv "${key_tmp}" "${OCI_LOCAL_KEY_FILE}"
  mv "${config_tmp}" "${OCI_LOCAL_CONFIG_FILE}"
  echo "Refreshed ${OCI_LOCAL_CONFIG_FILE} and ${OCI_LOCAL_KEY_FILE}."
}

# sync_oci_config_from_vault — for callers that don't already hold the values.
# Requires config.sh and lib/ssh-secrets.sh to be sourced.
sync_oci_config_from_vault() {
  if [ -n "$CI" ] || [ ! -f "${OCI_LOCAL_CONFIG_FILE}" ]; then
    return 0
  fi

  local vault_token creds config private_key
  vault_token=$(gcloud secrets versions access latest \
    --secret=VB_VM_VAULT_ROOT_TOKEN \
    --project="${GCP_PROJECT}" 2>/dev/null || echo "")

  if [ -n "$vault_token" ]; then
    creds=$(gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
echo "CONFIG=$(vault kv get -field=OCI_CONFIG '"${VAULT_KV_PATH}"'/secrets | base64 -w 0)"
echo "KEY=$(vault kv get -field=OCI_PRIVATE_KEY '"${VAULT_KV_PATH}"'/secrets | base64 -w 0)"
' VAULT_TOKEN "$vault_token" 2>/dev/null || echo "")
    config=$(sed -n 's/^CONFIG=//p' <<< "$creds" | tr -d '[:space:]' | base64 -d 2>/dev/null || echo "")
    private_key=$(sed -n 's/^KEY=//p' <<< "$creds" | tr -d '[:space:]' | base64 -d 2>/dev/null || echo "")
  fi

  if [ -z "$config" ] || [ -z "$private_key" ]; then
    echo "Warning: could not read OCI credentials from Vault — leaving ~/.oci untouched, rerun pnpm oci:config:sync-local" >&2
    return 0
  fi

  write_oci_local_config "$config" "$private_key"
}
