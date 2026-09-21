#!/bin/bash
# SSH into the Jellyfin Pi using the address from the Ansible inventory, so
# there is one place holding the host: ./pi-ssh.sh [command...]
# With --host it prints the address instead of connecting (used by
# `pnpm jellyfin:open`).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

INVENTORY="inventory/hosts.yml"
PI_HOST="${JELLYFIN_PI_HOST:-jellyfin-pi}"

if [ ! -f "$INVENTORY" ]; then
  echo "Missing ${INVENTORY}. Copy inventory/hosts.example.yml and fill it in." >&2
  exit 1
fi

HOST_VARS=$(ansible-inventory -i "$INVENTORY" --host "$PI_HOST")
ADDRESS=$(echo "$HOST_VARS" | jq -r '.ansible_host // empty')
USERNAME=$(echo "$HOST_VARS" | jq -r '.ansible_user // empty')

if [ -z "$ADDRESS" ] || [ -z "$USERNAME" ]; then
  echo "Inventory host '${PI_HOST}' is missing ansible_host or ansible_user." >&2
  exit 1
fi

if [ "${1:-}" = "--host" ]; then
  echo "$ADDRESS"
  exit 0
fi

exec ssh -t -o StrictHostKeyChecking=accept-new "${USERNAME}@${ADDRESS}" "$@"
