#!/bin/bash
set -e

exec 2>&1
exec 1>/var/log/vb-provision.log
echo "=== VB VM Image Provisioning Started at $(date) ==="

VAULT_VERSION="1.18.3"
VAULT_USER="vault"
VAULT_TLS_DIR="/etc/vault/tls"
VAULT_DATA_DIR="/opt/vault/data"

echo "Updating system packages..."
apt-get update

echo "Installing base packages..."
apt-get install -y \
  curl \
  wget \
  gnupg \
  ca-certificates \
  jq \
  unzip \
  vim \
  openssl \
  wireguard

echo "Installing Docker..."
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sh /tmp/get-docker.sh
systemctl enable docker
systemctl start docker

echo "Installing Vault ${VAULT_VERSION}..."
curl -fsSL "https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip" -o /tmp/vault.zip
unzip -o /tmp/vault.zip -d /usr/local/bin/
chmod +x /usr/local/bin/vault

echo "Creating vault user..."
if ! id -u ${VAULT_USER} >/dev/null 2>&1; then
  useradd --system --home /etc/vault --shell /bin/false ${VAULT_USER}
fi

echo "Creating Vault directories..."
mkdir -p /etc/vault
mkdir -p ${VAULT_TLS_DIR}
mkdir -p ${VAULT_DATA_DIR}
chown -R ${VAULT_USER}:${VAULT_USER} /etc/vault ${VAULT_DATA_DIR}

echo "Generating self-signed TLS cert for Vault..."
cp /tmp/vault-openssl.cnf ${VAULT_TLS_DIR}/vault-openssl.cnf

openssl genrsa -out ${VAULT_TLS_DIR}/vault.key 2048
openssl req -new -key ${VAULT_TLS_DIR}/vault.key \
  -out ${VAULT_TLS_DIR}/vault.csr \
  -config ${VAULT_TLS_DIR}/vault-openssl.cnf
openssl x509 -req -in ${VAULT_TLS_DIR}/vault.csr \
  -signkey ${VAULT_TLS_DIR}/vault.key \
  -out ${VAULT_TLS_DIR}/vault.crt \
  -days 3650 \
  -extfile ${VAULT_TLS_DIR}/vault-openssl.cnf \
  -extensions v3_ext

chown -R ${VAULT_USER}:${VAULT_USER} ${VAULT_TLS_DIR}
chmod 600 ${VAULT_TLS_DIR}/vault.key
chmod 644 ${VAULT_TLS_DIR}/vault.crt

echo "Installing Vault config..."
cp /tmp/vault-config.hcl /etc/vault/config.hcl
chown ${VAULT_USER}:${VAULT_USER} /etc/vault/config.hcl
chmod 640 /etc/vault/config.hcl

echo "Installing Vault systemd service..."
cp /tmp/vault.service /etc/systemd/system/vault.service

echo "Installing Google Cloud SDK..."
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | \
  tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
  gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
apt-get update && apt-get install -y google-cloud-cli

echo "Enabling IP forwarding for WireGuard..."
cp /tmp/99-wireguard.conf /etc/sysctl.d/99-wireguard.conf

echo "Installing WireGuard first-boot init..."
cp /tmp/wg-init.sh /usr/local/bin/wg-init.sh
chmod +x /usr/local/bin/wg-init.sh
cp /tmp/wg-init.service /etc/systemd/system/wg-init.service

systemctl daemon-reload
systemctl enable vault
systemctl enable wg-init.service

echo "=== VB VM Image Provisioning Completed Successfully at $(date) ==="
