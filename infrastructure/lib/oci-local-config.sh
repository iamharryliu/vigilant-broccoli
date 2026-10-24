#!/bin/bash
#
# Refreshes this machine's ~/.oci credentials from the values Vault holds.
# Terraform's oci provider reads them straight off disk (main.tf's
# `config_file_profile = "DEFAULT"`), and unlike every other provider they are
# not exported into the environment by load-vault-tf-env.sh — so after a
# rotation the local files name a fingerprint OCI has already deleted, and
# every `tf:*` command fails with a 401 until they are refreshed.

source "$(dirname "${BASH_SOURCE[0]}")/../terraform/packer/scripts/lib/vault-ops-token.sh"

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

  local creds config private_key

  if fetch_vault_ops_credentials 2>/dev/null; then
    creds=$(vault_ops_ssh '
echo "CONFIG=$(vault kv get -field=OCI_CONFIG '"${VAULT_KV_PATH}"'/secrets | base64 -w 0)"
echo "KEY=$(vault kv get -field=OCI_PRIVATE_KEY '"${VAULT_KV_PATH}"'/secrets | base64 -w 0)"
' 2>/dev/null || echo "")
    config=$(sed -n 's/^CONFIG=//p' <<< "$creds" | tr -d '[:space:]' | base64 -d 2>/dev/null || echo "")
    private_key=$(sed -n 's/^KEY=//p' <<< "$creds" | tr -d '[:space:]' | base64 -d 2>/dev/null || echo "")
  fi

  if [ -z "$config" ] || [ -z "$private_key" ]; then
    echo "Warning: could not read OCI credentials from Vault — leaving ~/.oci untouched, rerun pnpm oci:config:sync-local" >&2
    return 0
  fi

  write_oci_local_config "$config" "$private_key"
}
