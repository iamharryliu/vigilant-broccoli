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
  local code_server_cf_access_client_id
  local code_server_cf_access_client_secret
  local code_server_ip
  local journal_cf_access_client_id
  local journal_cf_access_client_secret

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
  code_server_cf_access_client_id=$(echo "$state_json" | jq -r '.resources[] | select(.type == "cloudflare_zero_trust_access_service_token" and .name == "code_server_ci") | .instances[0].attributes.client_id' 2>/dev/null || echo "")
  code_server_cf_access_client_secret=$(echo "$state_json" | jq -r '.resources[] | select(.type == "cloudflare_zero_trust_access_service_token" and .name == "code_server_ci") | .instances[0].attributes.client_secret' 2>/dev/null || echo "")
  code_server_ip=$(echo "$state_json" | jq -r '.resources[] | select(.type == "oci_core_instance" and .name == "code_server") | .instances[0].attributes.public_ip' 2>/dev/null || echo "")
  journal_cf_access_client_id=$(echo "$state_json" | jq -r '.resources[] | select(.type == "cloudflare_zero_trust_access_service_token" and .name == "journal_ci") | .instances[0].attributes.client_id' 2>/dev/null || echo "")
  journal_cf_access_client_secret=$(echo "$state_json" | jq -r '.resources[] | select(.type == "cloudflare_zero_trust_access_service_token" and .name == "journal_ci") | .instances[0].attributes.client_secret' 2>/dev/null || echo "")

  if [ -z "$ca_cert" ] || [ -z "$rabbitmq_ip" ] || [ -z "$rabbitmq_user" ] || [ -z "$rabbitmq_password" ] || [ -z "$email_api_key" ] || [ -z "$gcs_sa_credentials" ] || [ -z "$code_server_password" ] || [ -z "$ci_ssh_private_key" ] || [ -z "$gitea_cf_access_client_id" ] || [ -z "$gitea_cf_access_client_secret" ] || [ -z "$gitea_ip" ] || [ -z "$code_server_cf_access_client_id" ] || [ -z "$code_server_cf_access_client_secret" ] || [ -z "$code_server_ip" ] || [ -z "$journal_cf_access_client_id" ] || [ -z "$journal_cf_access_client_secret" ]; then
    echo "Warning: Some secrets not found in Terraform state. Skipping Vault sync."
    return
  fi

  local vault_ops_role_id
  local vault_ops_secret_id
  vault_ops_role_id=$(gcloud secrets versions access latest --secret="VB_VM_VAULT_OPS_ROLE_ID" 2>/dev/null || echo "")
  vault_ops_secret_id=$(gcloud secrets versions access latest --secret="VB_VM_VAULT_OPS_SECRET_ID" 2>/dev/null || echo "")

  if [ -z "$vault_ops_role_id" ] || [ -z "$vault_ops_secret_id" ]; then
    echo "Warning: Vault ops AppRole credentials not found in GCP Secret Manager. Skipping Vault sync."
    return
  fi

  # Use the DNS name (not the raw IP) so the connection string matches the
  # broker cert's SAN and stays consistent with rotate-rabbitmq-password.sh —
  # otherwise this sync silently flips Vault to the IP form and breaks the
  # curl-based mgmt/health checks that verify TLS against SNI 'rabbitmq'.
  local rabbitmq_host="socket.harryliu.dev"
  local conn_str="amqps://${rabbitmq_user}:${rabbitmq_password}@${rabbitmq_host}:5671"

  # RABBITMQ_CONNECTION_STRING has two authoritative sources at different times:
  # a fresh VM boots with Terraform's random_password (cloud-init), while
  # rotate-rabbitmq-password.sh sets a new password out-of-band and updates
  # Vault directly. So on an *update* we only patch Vault when the broker
  # actually accepts the Terraform password (i.e. the VM/password was recreated
  # this apply) — otherwise patching would overwrite the rotation password with
  # one the broker never received, causing 401s. On first-run seed we always
  # set it (fresh install, Terraform password is authoritative).
  local rmq_ssh_opts="-i $HOME/.ssh/id_ed25519 -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"
  # Wait for the broker to be up before probing — on a VM rebuild the container
  # may still be starting, and a premature probe would falsely conclude the
  # Terraform password is stale and skip the (needed) Vault sync.
  local rmq_ready=false
  for i in $(seq 1 30); do
    if ssh $rmq_ssh_opts "ubuntu@${rabbitmq_ip}" "sudo docker exec rabbitmq rabbitmqctl status" >/dev/null 2>&1; then
      rmq_ready=true
      break
    fi
    sleep 2
  done

  local rmq_sync_conn=false
  if [ "$rmq_ready" != true ]; then
    echo "Warning: RabbitMQ broker not reachable — leaving RABBITMQ_CONNECTION_STRING untouched (rerun pnpm tf:post-apply once the broker is up)."
  elif ssh $rmq_ssh_opts "ubuntu@${rabbitmq_ip}" \
    "sudo docker exec rabbitmq rabbitmqctl authenticate_user ${rabbitmq_user} '${rabbitmq_password}'" >/dev/null 2>&1; then
    echo "Broker accepts the Terraform password — will sync RABBITMQ_CONNECTION_STRING to Vault."
    rmq_sync_conn=true
  else
    echo "Broker rejects the Terraform password (rotation owns it) — leaving RABBITMQ_CONNECTION_STRING in Vault untouched."
  fi

  local ca_cert_b64=$(echo "$ca_cert" | base64 -w 0)
  # Trailing newline is required — $(...) strips it, and OpenSSH/libcrypto reject a key without it.
  local ci_ssh_key_b64=$(printf '%s\n' "$ci_ssh_private_key" | base64 -w 0)
  local socket_server_url="https://socket.harryliu.dev"

  # Every value below is a live secret, so it's built into a JSON blob and
  # piped over stdin (along with the AppRole login credentials) instead of
  # being interpolated into --command — that string would otherwise sit in
  # `ps` on the VM, readable by anyone else on the box, for the life of this
  # ssh session.
  local secrets_json
  secrets_json=$(jq -n \
    --arg rabbitmq_ca_cert "$ca_cert_b64" \
    --arg email_api_key "$email_api_key" \
    --arg gcs_sa_credentials "$gcs_sa_credentials" \
    --arg code_server_password "$code_server_password" \
    --arg socket_server_url "$socket_server_url" \
    --arg ci_ssh_key_b64 "$ci_ssh_key_b64" \
    --arg gitea_cf_access_client_id "$gitea_cf_access_client_id" \
    --arg gitea_cf_access_client_secret "$gitea_cf_access_client_secret" \
    --arg gitea_ip "$gitea_ip" \
    --arg code_server_cf_access_client_id "$code_server_cf_access_client_id" \
    --arg code_server_cf_access_client_secret "$code_server_cf_access_client_secret" \
    --arg code_server_ip "$code_server_ip" \
    --arg journal_cf_access_client_id "$journal_cf_access_client_id" \
    --arg journal_cf_access_client_secret "$journal_cf_access_client_secret" \
    '{
      RABBITMQ_CA_CERT: $rabbitmq_ca_cert,
      EMAIL_SERVICE_API_KEY: $email_api_key,
      GOOGLE_GCS_SA_CREDENTIALS: $gcs_sa_credentials,
      CODE_SERVER_PASSWORD: $code_server_password,
      SOCKET_SERVER_URL: $socket_server_url,
      OCI_VM_SSH_KEY: $ci_ssh_key_b64,
      GITEA_CF_ACCESS_CLIENT_ID: $gitea_cf_access_client_id,
      GITEA_CF_ACCESS_CLIENT_SECRET: $gitea_cf_access_client_secret,
      GITEA_VM_IP: $gitea_ip,
      CODE_SERVER_CF_ACCESS_CLIENT_ID: $code_server_cf_access_client_id,
      CODE_SERVER_CF_ACCESS_CLIENT_SECRET: $code_server_cf_access_client_secret,
      CODE_SERVER_VM_IP: $code_server_ip,
      JOURNAL_CF_ACCESS_CLIENT_ID: $journal_cf_access_client_id,
      JOURNAL_CF_ACCESS_CLIENT_SECRET: $journal_cf_access_client_secret
    }')

  { printf '%s\n%s\n%s\n%s\n' "$vault_ops_role_id" "$vault_ops_secret_id" "$rmq_sync_conn" "$conn_str"; echo "$secrets_json"; } \
    | gcloud compute ssh "${vm_name}" \
    --zone="${vm_zone}" \
    --tunnel-through-iap \
    --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt

read -r ROLE_ID
read -r SECRET_ID
read -r RMQ_SYNC_CONN
read -r CONN_STR
BASE_JSON=\$(cat)

VAULT_TOKEN=\$(vault write -field=token auth/approle/login role_id=\"\$ROLE_ID\" secret_id=\"\$SECRET_ID\")
export VAULT_TOKEN

if vault kv get kv/secrets >/dev/null 2>&1; then
  if [ \"\$RMQ_SYNC_CONN\" = true ]; then
    echo \"\$BASE_JSON\" | jq --arg c \"\$CONN_STR\" '. + {RABBITMQ_CONNECTION_STRING: \$c}' | vault kv patch kv/secrets @-
  else
    echo \"\$BASE_JSON\" | vault kv patch kv/secrets @-
  fi
else
  echo \"\$BASE_JSON\" | jq --arg c \"\$CONN_STR\" '. + {RABBITMQ_CONNECTION_STRING: \$c}' | vault kv put kv/secrets @-
fi

echo 'Secrets synced to Vault'
"
  echo "✓ Synced RABBITMQ_CA_CERT, EMAIL_SERVICE_API_KEY, GOOGLE_GCS_SA_CREDENTIALS, CODE_SERVER_PASSWORD, SOCKET_SERVER_URL, OCI_VM_SSH_KEY, GITEA_CF_ACCESS_CLIENT_ID, GITEA_CF_ACCESS_CLIENT_SECRET, GITEA_VM_IP, CODE_SERVER_CF_ACCESS_CLIENT_ID, CODE_SERVER_CF_ACCESS_CLIENT_SECRET, CODE_SERVER_VM_IP, JOURNAL_CF_ACCESS_CLIENT_ID, JOURNAL_CF_ACCESS_CLIENT_SECRET to kv/data/secrets (RABBITMQ_CONNECTION_STRING synced only when broker holds the Terraform password — see above; SHARED_APP_TOKEN is Vault-owned via rotate-secrets)"

  echo "Ensuring CI SSH key on socket-server VM (${rabbitmq_ip})..."
  ssh-keygen -R "$rabbitmq_ip" >/dev/null 2>&1 || true
  ssh $rmq_ssh_opts "ubuntu@${rabbitmq_ip}" \
    "grep -qF '${ci_ssh_public_key}' ~/.ssh/authorized_keys 2>/dev/null || echo '${ci_ssh_public_key}' >> ~/.ssh/authorized_keys" \
    && echo "✓ CI SSH key authorized on socket-server VM" \
    || echo "Warning: could not install CI SSH key on ${rabbitmq_ip} — rerun pnpm tf:post-apply"

  echo "Ensuring CI SSH key on gitea VM (${gitea_ip})..."
  ssh-keygen -R "$gitea_ip" >/dev/null 2>&1 || true
  ssh $rmq_ssh_opts "ubuntu@${gitea_ip}" \
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
