#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"
source "${SCRIPT_DIR}/../../../lib/ssh-secrets.sh"
source "${SCRIPT_DIR}/../../../lib/oci-local-config.sh"

OCI_API_VERSION="20160918"
OCI_CONTENT_TYPE="application/json"
OCI_KEY_BITS=2048
OCI_MAX_KEYS_PER_USER=3
VERIFY_INITIAL_DELAY_SECONDS=180
VERIFY_ATTEMPTS=30
VERIFY_DELAY_SECONDS=15

WORK_DIR=$(umask 077 && mktemp -d)
trap 'rm -rf "${WORK_DIR}"' EXIT

echo "Fetching root token from Secret Manager..."
VAULT_TOKEN=$(gcloud secrets versions access latest \
  --secret=VB_VM_VAULT_ROOT_TOKEN \
  --project="${GCP_PROJECT}")

echo "Reading current OCI credentials from Vault..."
# Both fields are multi-line, so they come back base64-encoded rather than as
# bare `KEY=value` lines the way the single-line rotators read theirs.
CREDS=$(gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
echo "CONFIG=$(vault kv get -field=OCI_CONFIG '"${VAULT_KV_PATH}"'/secrets | base64 -w 0)"
echo "KEY=$(vault kv get -field=OCI_PRIVATE_KEY '"${VAULT_KV_PATH}"'/secrets | base64 -w 0)"
' VAULT_TOKEN "$VAULT_TOKEN" 2>/dev/null)
CURRENT_CONFIG=$(sed -n 's/^CONFIG=//p' <<< "$CREDS" | tr -d '[:space:]' | base64 -d)
CURRENT_PRIVATE_KEY=$(sed -n 's/^KEY=//p' <<< "$CREDS" | tr -d '[:space:]' | base64 -d)

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

  curl -sSf -X "$(tr '[:lower:]' '[:upper:]' <<< "$method")" \
    -H "Date: ${date_header}" \
    -H "Authorization: Signature version=\"1\",keyId=\"${OCI_TENANCY}/${OCI_USER}/${fingerprint}\",algorithm=\"rsa-sha256\",headers=\"${signed_headers}\",signature=\"${signature}\"" \
    "${body_args[@]}" \
    "https://${OCI_IDENTITY_HOST}${path}"
}

list_fingerprints() {
  jq -r --arg skip "$2" '.[] | select(.fingerprint != $skip) | "  \(.fingerprint) (created \(.timeCreated))"' <<< "$1"
}

echo "Listing current API keys..."
EXISTING_KEYS=$(oci_request get "${API_KEYS_PATH}" "${CURRENT_KEY_FILE}" "${CURRENT_FINGERPRINT}" "")
EXISTING_COUNT=$(jq 'length' <<< "$EXISTING_KEYS")
echo "Found ${EXISTING_COUNT} key(s), active fingerprint ${CURRENT_FINGERPRINT}"

# Stop rather than prune: OCI keys carry no name, so a key this script did not
# mint is indistinguishable from an operator's working credential.
if [ "$EXISTING_COUNT" -ge "$OCI_MAX_KEYS_PER_USER" ]; then
  echo "ERROR: user holds ${EXISTING_COUNT} keys and OCI allows ${OCI_MAX_KEYS_PER_USER} — no room to mint a successor."
  echo "Delete one yourself, then re-run. Keys other than the active one:"
  list_fingerprints "$EXISTING_KEYS" "$CURRENT_FINGERPRINT"
  exit 1
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

# A new key is listed ACTIVE immediately but returns 401 NotAuthenticated until
# it syncs to the identity domain: measured at 307s in this tenancy, so the
# window is ~2x that and the first check waits rather than making 12 pointless
# requests. There is no state field to poll — lifecycleState is ACTIVE the
# whole time — so the request itself is the only readiness signal.
echo "Verifying new key (fingerprint: ${NEW_FINGERPRINT})..."
echo "  settling for ${VERIFY_INITIAL_DELAY_SECONDS}s before the first check..."
sleep "${VERIFY_INITIAL_DELAY_SECONDS}"
VERIFIED=""
VERIFY_ERROR=""
for ATTEMPT in $(seq 1 "${VERIFY_ATTEMPTS}"); do
  if VERIFY_ERROR=$(oci_request get "${OCI_USER_PATH}" "${NEW_KEY_FILE}" "${NEW_FINGERPRINT}" "" 2>&1 >/dev/null); then
    VERIFIED=1
    break
  fi
  echo "  attempt ${ATTEMPT}/${VERIFY_ATTEMPTS}: ${VERIFY_ERROR:-no detail}; retrying in ${VERIFY_DELAY_SECONDS}s..."
  sleep "${VERIFY_DELAY_SECONDS}"
done

if [ -z "$VERIFIED" ]; then
  echo "ERROR: New key failed verification after $((VERIFY_INITIAL_DELAY_SECONDS + VERIFY_ATTEMPTS * VERIFY_DELAY_SECONDS))s: ${VERIFY_ERROR:-no detail}"
  echo "Old key left untouched; removing the unusable successor."
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
gcloud_ssh_secrets "${VM_NAME}" "${GCP_ZONE}" '
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

vault kv patch '"${VAULT_KV_PATH}"'/secrets OCI_CONFIG="$NEW_CONFIG" OCI_PRIVATE_KEY="$NEW_PRIVATE_KEY"
' VAULT_TOKEN "$VAULT_TOKEN" NEW_CONFIG "$NEW_CONFIG" NEW_PRIVATE_KEY "$NEW_PRIVATE_KEY"

write_oci_local_config "$NEW_CONFIG" "$NEW_PRIVATE_KEY"

echo "Revoking the superseded key (${CURRENT_FINGERPRINT})..."
oci_request delete "${API_KEYS_PATH}/${CURRENT_FINGERPRINT}" "${NEW_KEY_FILE}" "${NEW_FINGERPRINT}" "" > /dev/null

REMAINING_KEYS=$(oci_request get "${API_KEYS_PATH}" "${NEW_KEY_FILE}" "${NEW_FINGERPRINT}" "")
UNMANAGED=$(list_fingerprints "$REMAINING_KEYS" "$NEW_FINGERPRINT")
if [ -n "$UNMANAGED" ]; then
  echo "Left in place — this script only revokes the key it replaced:"
  echo "$UNMANAGED"
fi

echo "✓ OCI API key rotated successfully (now ${NEW_FINGERPRINT})"
