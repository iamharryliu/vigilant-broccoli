#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../config.sh"

TERRAFORM_DIR="$SCRIPT_DIR/../"
WG_CONF="/opt/homebrew/etc/wireguard/vb.conf"

NEW_IP=$(cd "$TERRAFORM_DIR" && terraform output -raw gcp_vm_external_ip)
CURRENT_IP=$(grep 'Endpoint' "$WG_CONF" | sed 's/.*= \(.*\):.*/\1/')

sync_secrets_to_vault() {
  echo "Syncing secrets to Vault..."

  local vm_name="${VM_NAME}"
  local vm_zone="${GCP_ZONE}"

  cd "$TERRAFORM_DIR"
  local state_json
  state_json=$(terraform state pull)

  local ca_cert
  local rabbitmq_ip
  local rabbitmq_user
  local rabbitmq_password
  local email_api_key
  local gcs_sa_credentials
  local code_server_password
  local ci_ssh_private_key
  local ci_ssh_public_key
  local gitea_cf_access_client_id
  local gitea_cf_access_client_secret
  local gitea_ip

  ca_cert=$(echo "$state_json" | jq -r '.resources[] | select(.type == "tls_self_signed_cert" and .name == "rabbitmq_ca") | .instances[0].attributes.cert_pem' 2>/dev/null || echo "")
  rabbitmq_ip=$(echo "$state_json" | jq -r '.resources[] | select(.type == "oci_core_instance" and .name == "rabbitmq") | .instances[0].attributes.public_ip' 2>/dev/null || echo "")
  rabbitmq_user=$(echo "$state_json" | jq -r '.variables.rabbitmq_user.value // "admin"' 2>/dev/null)
  rabbitmq_password=$(echo "$state_json" | jq -r '.resources[] | select(.type == "random_password" and .name == "rabbitmq_password") | .instances[0].attributes.result' 2>/dev/null || echo "")
  email_api_key=$(echo "$state_json" | jq -r '.resources[] | select(.type == "random_password" and .name == "email_service_api_key") | .instances[0].attributes.result' 2>/dev/null || echo "")
  gcs_sa_credentials=$(echo "$state_json" | jq -r '.resources[] | select(.type == "google_service_account_key" and .name == "gcs_manager") | .instances[0].attributes.private_key' 2>/dev/null || echo "")
  code_server_password=$(echo "$state_json" | jq -r '.resources[] | select(.type == "random_password" and .name == "code_server_password") | .instances[0].attributes.result' 2>/dev/null || echo "")
  ci_ssh_private_key=$(echo "$state_json" | jq -r '.resources[] | select(.type == "tls_private_key" and .name == "oci_vm_ci_ssh") | .instances[0].attributes.private_key_openssh' 2>/dev/null || echo "")
  ci_ssh_public_key=$(echo "$state_json" | jq -r '.resources[] | select(.type == "tls_private_key" and .name == "oci_vm_ci_ssh") | .instances[0].attributes.public_key_openssh' 2>/dev/null || echo "")
  gitea_cf_access_client_id=$(echo "$state_json" | jq -r '.resources[] | select(.type == "cloudflare_zero_trust_access_service_token" and .name == "gitea_ci") | .instances[0].attributes.client_id' 2>/dev/null || echo "")
  gitea_cf_access_client_secret=$(echo "$state_json" | jq -r '.resources[] | select(.type == "cloudflare_zero_trust_access_service_token" and .name == "gitea_ci") | .instances[0].attributes.client_secret' 2>/dev/null || echo "")
  gitea_ip=$(echo "$state_json" | jq -r '.resources[] | select(.type == "oci_core_instance" and .name == "gitea") | .instances[0].attributes.public_ip' 2>/dev/null || echo "")

  if [ -z "$ca_cert" ] || [ -z "$rabbitmq_ip" ] || [ -z "$rabbitmq_user" ] || [ -z "$rabbitmq_password" ] || [ -z "$email_api_key" ] || [ -z "$gcs_sa_credentials" ] || [ -z "$code_server_password" ] || [ -z "$ci_ssh_private_key" ] || [ -z "$gitea_cf_access_client_id" ] || [ -z "$gitea_cf_access_client_secret" ] || [ -z "$gitea_ip" ]; then
    echo "Warning: Some secrets not found in Terraform state. Skipping Vault sync."
    return
  fi

  local vault_token
  vault_token=$(gcloud secrets versions access latest --secret="VB_VM_VAULT_ROOT_TOKEN" 2>/dev/null || echo "")

  if [ -z "$vault_token" ]; then
    echo "Warning: Vault root token not found in GCP Secret Manager. Skipping Vault sync."
    return
  fi

  local conn_str="amqps://${rabbitmq_user}:${rabbitmq_password}@${rabbitmq_ip}:5671"
  local ca_cert_b64=$(echo "$ca_cert" | base64 -w 0)
  local ci_ssh_key_b64=$(printf '%s' "$ci_ssh_private_key" | base64 -w 0)
  local socket_server_url="https://socket.harryliu.dev"

  gcloud compute ssh "${vm_name}" \
    --zone="${vm_zone}" \
    --tunnel-through-iap \
    --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${vault_token}'

if vault kv get kv/secrets >/dev/null 2>&1; then
  vault kv patch kv/secrets \
    RABBITMQ_CA_CERT='${ca_cert_b64}' \
    RABBITMQ_CONNECTION_STRING='${conn_str}' \
    EMAIL_SERVICE_API_KEY='${email_api_key}' \
    GOOGLE_GCS_SA_CREDENTIALS='${gcs_sa_credentials}' \
    CODE_SERVER_PASSWORD='${code_server_password}' \
    SOCKET_SERVER_URL='${socket_server_url}' \
    OCI_VM_SSH_KEY='${ci_ssh_key_b64}' \
    GITEA_CF_ACCESS_CLIENT_ID='${gitea_cf_access_client_id}' \
    GITEA_CF_ACCESS_CLIENT_SECRET='${gitea_cf_access_client_secret}' \
    GITEA_VM_IP='${gitea_ip}'
else
  vault kv put kv/secrets \
    RABBITMQ_CA_CERT='${ca_cert_b64}' \
    RABBITMQ_CONNECTION_STRING='${conn_str}' \
    EMAIL_SERVICE_API_KEY='${email_api_key}' \
    GOOGLE_GCS_SA_CREDENTIALS='${gcs_sa_credentials}' \
    CODE_SERVER_PASSWORD='${code_server_password}' \
    SOCKET_SERVER_URL='${socket_server_url}' \
    OCI_VM_SSH_KEY='${ci_ssh_key_b64}' \
    GITEA_CF_ACCESS_CLIENT_ID='${gitea_cf_access_client_id}' \
    GITEA_CF_ACCESS_CLIENT_SECRET='${gitea_cf_access_client_secret}' \
    GITEA_VM_IP='${gitea_ip}'
fi

echo 'Secrets synced to Vault'
"
  echo "✓ Synced RABBITMQ_CA_CERT, RABBITMQ_CONNECTION_STRING, EMAIL_SERVICE_API_KEY, GOOGLE_GCS_SA_CREDENTIALS, CODE_SERVER_PASSWORD, SOCKET_SERVER_URL, OCI_VM_SSH_KEY, GITEA_CF_ACCESS_CLIENT_ID, GITEA_CF_ACCESS_CLIENT_SECRET, GITEA_VM_IP to kv/data/secrets (SHARED_APP_TOKEN is Vault-owned via rotate-secrets)"

  echo "Ensuring CI SSH key on socket-server VM (${rabbitmq_ip})..."
  ssh-keygen -R "$rabbitmq_ip" >/dev/null 2>&1 || true
  ssh -i "$HOME/.ssh/id_ed25519" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 "ubuntu@${rabbitmq_ip}" \
    "grep -qF '${ci_ssh_public_key}' ~/.ssh/authorized_keys 2>/dev/null || echo '${ci_ssh_public_key}' >> ~/.ssh/authorized_keys" \
    && echo "✓ CI SSH key authorized on socket-server VM" \
    || echo "Warning: could not install CI SSH key on ${rabbitmq_ip} — rerun pnpm tf:post-apply"

  echo "Ensuring CI SSH key on gitea VM (${gitea_ip})..."
  ssh-keygen -R "$gitea_ip" >/dev/null 2>&1 || true
  ssh -i "$HOME/.ssh/id_ed25519" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 "ubuntu@${gitea_ip}" \
    "grep -qF '${ci_ssh_public_key}' ~/.ssh/authorized_keys 2>/dev/null || echo '${ci_ssh_public_key}' >> ~/.ssh/authorized_keys" \
    && echo "✓ CI SSH key authorized on gitea VM" \
    || echo "Warning: could not install CI SSH key on ${gitea_ip} — rerun pnpm tf:post-apply"
}

sync_socket_server() {
  "${SCRIPT_DIR}/../packer/scripts/sync-socket-server-token.sh"

  echo "Verifying socket server health..."
  for i in $(seq 1 30); do
    if curl -s --max-time 5 https://socket.harryliu.dev/health 2>/dev/null | grep -q ok; then
      echo "✓ https://socket.harryliu.dev/health"
      return 0
    fi
    sleep 10
  done
  echo "Socket server health check failed" >&2
  return 1
}

if [ "$NEW_IP" = "$CURRENT_IP" ]; then
  sync_secrets_to_vault
  sync_socket_server
  exit 0
fi

echo "VM IP changed ($CURRENT_IP -> $NEW_IP). Running post-apply steps..."

echo "Step 1/4: Waiting for VM SSH to become available..."
until gcloud compute ssh "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --tunnel-through-iap \
  --command="exit 0" \
  --ssh-flag="-o ConnectTimeout=5" \
  --quiet 2>/dev/null; do
  echo "  SSH not ready, retrying in 10s..."
  sleep 10
done
echo "  SSH ready."

echo "Step 2/4: Running vault post-init..."
npm run gcp:vm:post-init

echo "Step 3/4: Syncing secrets to Vault..."
sync_secrets_to_vault

echo "Step 4/4: Regenerating vault cert + updating WireGuard endpoint..."
npm run gcp:vm:regen-cert

sync_socket_server

echo "Post-apply complete."
