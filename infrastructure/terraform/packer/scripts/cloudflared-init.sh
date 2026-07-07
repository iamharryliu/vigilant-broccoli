#!/bin/bash
set -e

CLOUDFLARED_ENV_DIR="/etc/cloudflared"
CLOUDFLARED_ENV_FILE="${CLOUDFLARED_ENV_DIR}/env"
CLOUDFLARED_INIT_DONE="/var/lib/cloudflared-init.done"

if [ -f "${CLOUDFLARED_INIT_DONE}" ]; then
  echo "cloudflared already initialized, skipping."
  exit 0
fi

echo "Fetching cloudflared tunnel token from Secret Manager..."

TUNNEL_TOKEN=$(gcloud secrets versions access latest --secret=VB_VM_CLOUDFLARED_TUNNEL_TOKEN)

if [ -z "${TUNNEL_TOKEN}" ]; then
  echo "ERROR: VB_VM_CLOUDFLARED_TUNNEL_TOKEN is empty"
  exit 1
fi

echo "Writing ${CLOUDFLARED_ENV_FILE}..."

umask 077
mkdir -p "${CLOUDFLARED_ENV_DIR}"
printf 'TUNNEL_TOKEN=%s\n' "${TUNNEL_TOKEN}" > "${CLOUDFLARED_ENV_FILE}"
chmod 600 "${CLOUDFLARED_ENV_FILE}"

echo "Enabling cloudflared..."
systemctl enable cloudflared
systemctl start cloudflared

touch "${CLOUDFLARED_INIT_DONE}"
echo "cloudflared initialized successfully."
