#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Destination: a local path (default) or a gs:// URI to upload to.
DEST="${1:-gitea-dump-$(date -u +%Y-%m-%d).zip}"
case "$DEST" in
  gs://*) OUT=$(mktemp -t gitea-dump.XXXXXX.zip); trap 'rm -f "$OUT"' EXIT ;;
  *) OUT="$DEST" ;;
esac

# Hostname is Cloudflare-proxied, so SSH targets the VM's real IP.
GITEA_IP=$(cd "${SCRIPT_DIR}/../../" && terraform output -raw oci_gitea_public_ip)
GITEA_SSH="ubuntu@${GITEA_IP}"
SSH_OPTS="-i $HOME/.ssh/id_ed25519 -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15"

echo "Running gitea dump on the VM (${GITEA_IP})..."
ssh $SSH_OPTS "$GITEA_SSH" \
  'sudo docker exec -u git -w /tmp gitea gitea dump -t /tmp -c /data/gitea/conf/app.ini --file gitea-dump.zip \
   && sudo docker cp gitea:/tmp/gitea-dump.zip /tmp/gitea-dump.zip \
   && sudo chown "$(id -u):$(id -g)" /tmp/gitea-dump.zip \
   && sudo docker exec -u git gitea rm -f /tmp/gitea-dump.zip'

echo "Downloading dump..."
scp $SSH_OPTS "${GITEA_SSH}:/tmp/gitea-dump.zip" "$OUT"
ssh $SSH_OPTS "$GITEA_SSH" 'sudo rm -f /tmp/gitea-dump.zip'

case "$DEST" in
  gs://*) gsutil cp "$OUT" "$DEST" && echo "✓ Uploaded to ${DEST}" ;;
  *) echo "✓ Saved ${DEST}" ;;
esac
