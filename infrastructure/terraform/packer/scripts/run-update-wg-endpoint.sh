#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "${SCRIPT_DIR}/../../../config.sh"

WG_CONF="/opt/homebrew/etc/wireguard/vb.conf"

EXTERNAL_IP=$(gcloud compute instances describe "${VM_NAME}" \
  --zone="${GCP_ZONE}" \
  --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

if [ -z "${EXTERNAL_IP}" ]; then
  echo "ERROR: Could not get external IP for ${VM_NAME}"
  exit 1
fi

echo "VM external IP: ${EXTERNAL_IP}"
sed -i '' "s|Endpoint = .*:51820|Endpoint = ${EXTERNAL_IP}:51820|" "${WG_CONF}"
echo "WireGuard endpoint updated to: ${EXTERNAL_IP}:51820"
