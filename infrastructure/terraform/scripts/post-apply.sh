#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WG_CONF="/opt/homebrew/etc/wireguard/vb.conf"

NEW_IP=$(cd "$SCRIPT_DIR/../" && terraform output -raw vb_free_vm_external_ip)
CURRENT_IP=$(grep 'Endpoint' "$WG_CONF" | sed 's/.*= \(.*\):.*/\1/')

echo "Terraform VM IP: $NEW_IP"
echo "Current WG endpoint: $CURRENT_IP"

if [ "$NEW_IP" = "$CURRENT_IP" ]; then
  echo "VM IP unchanged. No post-apply steps needed."
  exit 0
fi

echo "VM IP changed ($CURRENT_IP -> $NEW_IP). Running post-apply steps..."

echo "Step 1/2: Running vault post-init..."
npm run gcp:vm:post-init

echo "Step 2/2: Regenerating vault cert + updating WireGuard endpoint..."
npm run gcp:vm:regen-cert

echo "Post-apply complete."
