#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"

OCI_API_VERSION="20160918"
OCI_CONTENT_TYPE="application/json"
OCI_KEY_BITS=2048
OCI_MAX_KEYS_PER_USER=3
VERIFY_ATTEMPTS=6
VERIFY_DELAY_SECONDS=5

WORK_DIR=$(umask 077 && mktemp -d)
trap 'rm -rf "${WORK_DIR}"' EXIT

# CI mode (VAULT_ADDR set by the rotate-secrets workflow): current credentials
# and VAULT_TOKEN come from the vault-secrets action, Vault is reached through
# the Cloudflare Access tunnel. Local mode: both go through gcloud + IAP SSH.
if [ -z "$VAULT_ADDR" ]; then
  echo "Fetching root token from Secret Manager..."
  VAULT_TOKEN=$(gcloud secrets versions access latest \
    --secret=VB_VM_VAULT_ROOT_TOKEN \
    --project="${GCP_PROJECT}")

  echo "Reading current OCI credentials from Vault..."
  # Both fields are multi-line, so they come back base64-encoded rather than
  # as bare `KEY=value` lines the way the single-line rotators read theirs.
  CREDS=$(gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
echo "CONFIG=$(vault kv get -field=OCI_CONFIG '"${VAULT_KV_PATH}"'/secrets | base64 -w 0)"
echo "KEY=$(vault kv get -field=OCI_PRIVATE_KEY '"${VAULT_KV_PATH}"'/secrets | base64 -w 0)"
' VAULT_TOKEN "$VAULT_TOKEN" 2>/dev/null)
  CURRENT_CONFIG=$(sed -n 's/^CONFIG=//p' <<< "$CREDS" | tr -d '[:space:]' | base64 -d)
  CURRENT_PRIVATE_KEY=$(sed -n 's/^KEY=//p' <<< "$CREDS" | tr -d '[:space:]' | base64 -d)
else
  CURRENT_CONFIG="$OCI_CONFIG"
  CURRENT_PRIVATE_KEY="$OCI_PRIVATE_KEY"
fi

if [ -z "$CURRENT_CONFIG" ] || [ -z "$CURRENT_PRIVATE_KEY" ]; then
  echo "ERROR: current OCI credentials not available"
  exit 1
fi

config_field() {
  sed -n "s/^[[:space:]]*$1[[:space:]]*=[[:space:]]*//p" <<< "$CURRENT_CONFIG" | head -1 | tr -d '[:space:]'
}

OCI_USER=$(config_field user)
OCI_TENANCY=$(config_field tenancy)
OCI_REGION=$(config_field region)
CURRENT_FINGERPRINT=$(config_field fingerprint)

if [ -z "$OCI_USER" ] || [ -z "$OCI_TENANCY" ] || [ -z "$OCI_REGION" ] || [ -z "$CURRENT_FINGERPRINT" ]; then
  echo "ERROR: OCI_CONFIG is missing user/tenancy/region/fingerprint"
  exit 1
fi

OCI_IDENTITY_HOST="identity.${OCI_REGION}.oraclecloud.com"
OCI_USER_PATH="/${OCI_API_VERSION}/users/${OCI_USER}"
API_KEYS_PATH="${OCI_USER_PATH}/apiKeys"

CURRENT_KEY_FILE="${WORK_DIR}/current.pem"
printf '%s\n' "$CURRENT_PRIVATE_KEY" > "${CURRENT_KEY_FILE}"

# OCI has no token endpoint: every request is signed per draft-cavage HTTP
# signatures, with GET/DELETE covering (request-target)/host/date and writes
# additionally covering the body digest, content-type and length.
# https://docs.oracle.com/en-us/iaas/Content/API/Concepts/signingrequests.htm
# IAM writes are only accepted in the tenancy's home region, which is the
# region the stored config points at.
oci_request() {
  local method="$1" path="$2" key_file="$3" fingerprint="$4" body="$5"
  local date_header signing_string signed_headers signature
  local body_args=()

  date_header=$(date -u +"%a, %d %b %Y %H:%M:%S GMT")
  signing_string="(request-target): ${method} ${path}
host: ${OCI_IDENTITY_HOST}
date: ${date_header}"
  signed_headers="(request-target) host date"

  if [ -n "$body" ]; then
    local digest
    digest=$(printf '%s' "$body" | openssl dgst -sha256 -binary | openssl base64 -A)
    signing_string="${signing_string}
x-content-sha256: ${digest}
content-type: ${OCI_CONTENT_TYPE}
content-length: ${#body}"
    signed_headers="${signed_headers} x-content-sha256 content-type content-length"
    body_args=(-H "x-content-sha256: ${digest}" -H "Content-Type: ${OCI_CONTENT_TYPE}" \
      -H "Content-Length: ${#body}" --data-binary "$body")
  fi

  signature=$(printf '%s' "$signing_string" | openssl dgst -sha256 -sign "${key_file}" | openssl base64 -A)

  curl -sf -X "$(tr '[:lower:]' '[:upper:]' <<< "$method")" \
    -H "Date: ${date_header}" \
    -H "Authorization: Signature version=\"1\",keyId=\"${OCI_TENANCY}/${OCI_USER}/${fingerprint}\",algorithm=\"rsa-sha256\",headers=\"${signed_headers}\",signature=\"${signature}\"" \
    "${body_args[@]}" \
    "https://${OCI_IDENTITY_HOST}${path}"
}

delete_keys_except() {
  local keep="$1" keys="$2" key_file="$3" signing_fingerprint="$4" stale
  for stale in $(jq -r --arg keep "$keep" '.[] | select(.fingerprint != $keep) | .fingerprint' <<< "$keys"); do
    echo "Deleting key (fingerprint: ${stale})..."
    oci_request delete "${API_KEYS_PATH}/${stale}" "$key_file" "$signing_fingerprint" "" > /dev/null
  done
}

echo "Listing current API keys..."
EXISTING_KEYS=$(oci_request get "${API_KEYS_PATH}" "${CURRENT_KEY_FILE}" "${CURRENT_FINGERPRINT}" "")
EXISTING_COUNT=$(jq 'length' <<< "$EXISTING_KEYS")
echo "Found ${EXISTING_COUNT} key(s), active fingerprint ${CURRENT_FINGERPRINT}"

# A user may hold at most 3 API keys, so a leftover from a half-finished run
# would make the upload below fail; drop everything but the live key first.
if [ "$EXISTING_COUNT" -ge "$OCI_MAX_KEYS_PER_USER" ]; then
  echo "At the ${OCI_MAX_KEYS_PER_USER}-key limit; pruning stale keys to make room..."
  delete_keys_except "$CURRENT_FINGERPRINT" "$EXISTING_KEYS" "${CURRENT_KEY_FILE}" "$CURRENT_FINGERPRINT"
fi

echo "Minting successor key..."
NEW_KEY_FILE="${WORK_DIR}/new.pem"
openssl genrsa -out "${NEW_KEY_FILE}" "${OCI_KEY_BITS}" 2>/dev/null
NEW_PUBLIC_KEY=$(openssl rsa -in "${NEW_KEY_FILE}" -pubout 2>/dev/null)
NEW_FINGERPRINT=$(openssl rsa -in "${NEW_KEY_FILE}" -pubout -outform DER 2>/dev/null \
  | openssl dgst -md5 -c | sed 's/^.*= //')

UPLOAD=$(oci_request post "${API_KEYS_PATH}" "${CURRENT_KEY_FILE}" "${CURRENT_FINGERPRINT}" \
  "$(jq -nc --arg key "$NEW_PUBLIC_KEY" '{key: $key}')")
UPLOADED_FINGERPRINT=$(jq -r '.fingerprint // empty' <<< "$UPLOAD")

if [ "$UPLOADED_FINGERPRINT" != "$NEW_FINGERPRINT" ]; then
  echo "ERROR: upload returned fingerprint '${UPLOADED_FINGERPRINT}', expected '${NEW_FINGERPRINT}'"
  exit 1
fi

# A freshly uploaded key is rejected for a few seconds before IAM has it
# everywhere, so a single 401 here is not yet a failure.
echo "Verifying new key (fingerprint: ${NEW_FINGERPRINT})..."
VERIFIED=""
for ATTEMPT in $(seq 1 "${VERIFY_ATTEMPTS}"); do
  if oci_request get "${OCI_USER_PATH}" "${NEW_KEY_FILE}" "${NEW_FINGERPRINT}" "" > /dev/null 2>&1; then
    VERIFIED=1
    break
  fi
  echo "  attempt ${ATTEMPT}/${VERIFY_ATTEMPTS} not accepted yet, retrying in ${VERIFY_DELAY_SECONDS}s..."
  sleep "${VERIFY_DELAY_SECONDS}"
done

if [ -z "$VERIFIED" ]; then
  echo "ERROR: New key failed verification; old key left untouched"
  oci_request delete "${API_KEYS_PATH}/${NEW_FINGERPRINT}" "${CURRENT_KEY_FILE}" "${CURRENT_FINGERPRINT}" "" > /dev/null || true
  exit 1
fi

# The fingerprint in OCI_CONFIG identifies the key in OCI_PRIVATE_KEY, so the
# two have to land in Vault together — a config left pointing at the previous
# fingerprint authenticates nothing.
NEW_CONFIG=$(sed "s|^\([[:space:]]*fingerprint[[:space:]]*=\).*|\1${NEW_FINGERPRINT}|" <<< "$CURRENT_CONFIG")
if ! grep -q "fingerprint[[:space:]]*=[[:space:]]*${NEW_FINGERPRINT}" <<< "$NEW_CONFIG"; then
  echo "ERROR: could not rewrite the fingerprint line in OCI_CONFIG"
  exit 1
fi
NEW_PRIVATE_KEY=$(cat "${NEW_KEY_FILE}")

echo "Updating Vault with new config and key..."
if [ -z "$VAULT_ADDR" ]; then
  gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv patch '"${VAULT_KV_PATH}"'/secrets OCI_CONFIG="$NEW_CONFIG" OCI_PRIVATE_KEY="$NEW_PRIVATE_KEY"
' VAULT_TOKEN "$VAULT_TOKEN" NEW_CONFIG "$NEW_CONFIG" NEW_PRIVATE_KEY "$NEW_PRIVATE_KEY"
else
  # Built with jq rather than an inline -d string: both values are multi-line
  # PEM/INI blobs that have to reach Vault with their newlines escaped.
  jq -nc --arg config "$NEW_CONFIG" --arg key "$NEW_PRIVATE_KEY" \
    '{data: {OCI_CONFIG: $config, OCI_PRIVATE_KEY: $key}}' \
    | curl -sf -o /dev/null \
      -H "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" \
      -H "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}" \
      -H "X-Vault-Token: ${VAULT_TOKEN}" \
      -X PATCH -H "Content-Type: application/merge-patch+json" \
      --data-binary @- \
      "${VAULT_ADDR}/v1/${VAULT_KV_PATH}/data/secrets"
fi

echo "Deleting all other API keys (single-key policy)..."
REMAINING_KEYS=$(oci_request get "${API_KEYS_PATH}" "${NEW_KEY_FILE}" "${NEW_FINGERPRINT}" "")
delete_keys_except "$NEW_FINGERPRINT" "$REMAINING_KEYS" "${NEW_KEY_FILE}" "$NEW_FINGERPRINT"

REMAINING=$(oci_request get "${API_KEYS_PATH}" "${NEW_KEY_FILE}" "${NEW_FINGERPRINT}" "" | jq 'length')
echo "✓ OCI API key rotated successfully (${REMAINING} key active)"
