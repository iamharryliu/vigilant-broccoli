#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../"
WG_CONF="/opt/homebrew/etc/wireguard/vb.conf"

NEW_IP=$(cd "$TERRAFORM_DIR" && terraform output -raw vb_free_vm_external_ip)
CURRENT_IP=$(grep 'Endpoint' "$WG_CONF" | sed 's/.*= \(.*\):.*/\1/')

echo "Terraform VM IP: $NEW_IP"
echo "Current WG endpoint: $CURRENT_IP"

sync_secrets_to_vault() {
  echo "Syncing secrets to Vault..."

  local vm_name="vb-free-vm"
  local vm_zone="us-east1-b"

  cd "$TERRAFORM_DIR"
  local state_json
  state_json=$(terraform state pull)

  local ca_cert
  local rabbitmq_ip
  local rabbitmq_user
  local rabbitmq_password
  local email_api_key

  ca_cert=$(echo "$state_json" | jq -r '.resources[] | select(.type == "tls_self_signed_cert" and .name == "rabbitmq") | .instances[0].attributes.cert_pem' 2>/dev/null || echo "")
  rabbitmq_ip=$(echo "$state_json" | jq -r '.resources[] | select(.type == "oci_core_instance" and .name == "rabbitmq") | .instances[0].attributes.public_ip' 2>/dev/null || echo "")
  rabbitmq_user=$(echo "$state_json" | jq -r '.variables.rabbitmq_user.value // "admin"' 2>/dev/null)
  rabbitmq_password=$(echo "$state_json" | jq -r '.resources[] | select(.type == "random_password" and .name == "rabbitmq_password") | .instances[0].attributes.result' 2>/dev/null || echo "")
  email_api_key=$(echo "$state_json" | jq -r '.resources[] | select(.type == "random_password" and .name == "email_service_api_key") | .instances[0].attributes.result' 2>/dev/null || echo "")

  if [ -z "$ca_cert" ] || [ -z "$rabbitmq_ip" ] || [ -z "$rabbitmq_user" ] || [ -z "$rabbitmq_password" ] || [ -z "$email_api_key" ]; then
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

  gcloud compute ssh "${vm_name}" \
    --zone="${vm_zone}" \
    --tunnel-through-iap \
    --command="
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_CACERT=/etc/vault/tls/vault.crt
export VAULT_TOKEN='${vault_token}'

vault kv patch kv/secrets \
  RABBITMQ_CA_CERT='${ca_cert}' \
  RABBITMQ_CONNECTION_STRING='${conn_str}' \
  EMAIL_SERVICE_API_KEY='${email_api_key}'

echo 'Secrets synced to Vault'
"
  echo "✓ Synced RABBITMQ_CA_CERT, RABBITMQ_CONNECTION_STRING, and EMAIL_SERVICE_API_KEY to kv/data/secrets"
}

if [ "$NEW_IP" = "$CURRENT_IP" ]; then
  echo "VM IP unchanged. Syncing secrets to Vault..."
  sync_secrets_to_vault
  exit 0
fi

echo "VM IP changed ($CURRENT_IP -> $NEW_IP). Running post-apply steps..."

echo "Step 1/3: Running vault post-init..."
npm run gcp:vm:post-init

echo "Step 2/3: Syncing secrets to Vault..."
sync_secrets_to_vault

echo "Step 3/3: Regenerating vault cert + updating WireGuard endpoint..."
npm run gcp:vm:regen-cert

echo "Post-apply complete."
