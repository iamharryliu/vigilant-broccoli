#!/bin/bash
# SSH into an OCI VM by terraform output name: ./oci-ssh.sh <output_name> [command]
# VMs are replaceable and OCI recycles IPs, so a stale known_hosts entry is
# detected (stored key no longer offered by the host) and removed before connecting.
set -e

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
IP=$(cd "$REPO_ROOT/infrastructure/terraform" && terraform output -raw "$1")
shift

STORED_KEYS=$(ssh-keygen -F "$IP" | grep -v '^#' || true)
SCANNED_KEYS=$(ssh-keyscan "$IP" 2>/dev/null || true)
if [ -n "$STORED_KEYS" ] && [ -n "$SCANNED_KEYS" ]; then
  MATCH=false
  while IFS= read -r stored; do
    key=$(echo "$stored" | cut -d' ' -f2-)
    if echo "$SCANNED_KEYS" | grep -qF "$key"; then
      MATCH=true
    fi
  done <<<"$STORED_KEYS"
  if [ "$MATCH" = false ]; then
    echo "Host key changed for $IP (VM replaced or IP recycled) — removing stale known_hosts entry."
    ssh-keygen -R "$IP"
  fi
fi

exec ssh -t -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=accept-new ubuntu@"$IP" "$@"
