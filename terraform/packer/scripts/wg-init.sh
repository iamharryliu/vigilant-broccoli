#!/bin/bash
set -e

WG_CONF="/etc/wireguard/wg0.conf"
WG_SERVER_ADDRESS="10.0.1.1/24"
WG_LISTEN_PORT="51820"
WG_INIT_DONE="/var/lib/wg-init.done"

if [ -f "${WG_INIT_DONE}" ]; then
  echo "WireGuard already initialized, skipping."
  exit 0
fi

echo "Fetching WireGuard keys from Secret Manager..."

SERVER_PRIVATE_KEY=$(gcloud secrets versions access latest --secret=VB_VM_WG_SERVER_PRIVATE_KEY)
PEER_LAPTOP_PUBLIC_KEY=$(gcloud secrets versions access latest --secret=VB_VM_WG_ELVA11_MBP_PUBLIC_KEY)

if [ -z "${SERVER_PRIVATE_KEY}" ]; then
  echo "ERROR: VB_VM_WG_SERVER_PRIVATE_KEY is empty"
  exit 1
fi

echo "Writing ${WG_CONF}..."

umask 077
cat > "${WG_CONF}" <<EOF
[Interface]
Address = ${WG_SERVER_ADDRESS}
ListenPort = ${WG_LISTEN_PORT}
PrivateKey = ${SERVER_PRIVATE_KEY}

EOF

if [ -n "${PEER_LAPTOP_PUBLIC_KEY}" ]; then
  cat >> "${WG_CONF}" <<EOF
[Peer]
PublicKey = ${PEER_LAPTOP_PUBLIC_KEY}
AllowedIPs = 10.0.1.2/32
EOF
fi

chmod 600 "${WG_CONF}"

echo "Enabling wg-quick@wg0..."
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

touch "${WG_INIT_DONE}"
echo "WireGuard initialized successfully."
