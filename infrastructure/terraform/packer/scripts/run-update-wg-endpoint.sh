#!/bin/bash
set -e

VM_NAME="vb-free-vm"
VM_ZONE="us-east1-b"
WG_CONF="/opt/homebrew/etc/wireguard/vb.conf"

EXTERNAL_IP=$(gcloud compute instances describe "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

if [ -z "${EXTERNAL_IP}" ]; then
  echo "ERROR: Could not get external IP for ${VM_NAME}"
  exit 1
fi

echo "VM external IP: ${EXTERNAL_IP}"
sed -i '' "s|Endpoint = .*:51820|Endpoint = ${EXTERNAL_IP}:51820|" "${WG_CONF}"
echo "WireGuard endpoint updated to: ${EXTERNAL_IP}:51820"
