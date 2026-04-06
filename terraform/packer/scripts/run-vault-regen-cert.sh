#!/bin/bash
set -e

VM_NAME="vb-free-vm"
VM_ZONE="us-east1-b"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_CERT="${SCRIPT_DIR}/../../../projects/nx-workspace/scripts/vault-ca.crt"

EXTERNAL_IP=$(gcloud compute instances describe "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

if [ -z "${EXTERNAL_IP}" ]; then
  echo "ERROR: Could not get external IP for ${VM_NAME}"
  exit 1
fi

echo "VM external IP: ${EXTERNAL_IP}"
echo "Regenerating Vault TLS cert with SAN for ${EXTERNAL_IP}..."

gcloud compute ssh "${VM_NAME}" \
  --zone="${VM_ZONE}" \
  --tunnel-through-iap \
  --command="
set -e
VAULT_TLS_DIR=/etc/vault/tls

sudo tee \${VAULT_TLS_DIR}/vault-openssl.cnf > /dev/null <<CNF
[ req ]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_ext

[ dn ]
CN = vb-vault

[ alt_names ]
DNS.1 = vb-vault
DNS.2 = localhost
IP.1 = 127.0.0.1
IP.2 = 10.0.1.1
IP.3 = ${EXTERNAL_IP}

[ v3_ext ]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
CNF

sudo openssl genrsa -out \${VAULT_TLS_DIR}/vault.key 2048
sudo openssl req -new -key \${VAULT_TLS_DIR}/vault.key \
  -out \${VAULT_TLS_DIR}/vault.csr \
  -config \${VAULT_TLS_DIR}/vault-openssl.cnf
sudo openssl x509 -req -in \${VAULT_TLS_DIR}/vault.csr \
  -signkey \${VAULT_TLS_DIR}/vault.key \
  -out \${VAULT_TLS_DIR}/vault.crt \
  -days 3650 \
  -extfile \${VAULT_TLS_DIR}/vault-openssl.cnf \
  -extensions v3_ext

sudo chown vault:vault \${VAULT_TLS_DIR}/vault.key \${VAULT_TLS_DIR}/vault.crt
sudo chmod 600 \${VAULT_TLS_DIR}/vault.key
sudo chmod 644 \${VAULT_TLS_DIR}/vault.crt

sudo systemctl restart vault
echo 'Vault restarted with new cert.'
"

echo "Copying cert to local repo..."
gcloud compute scp \
  --tunnel-through-iap \
  --zone="${VM_ZONE}" \
  "${VM_NAME}":/etc/vault/tls/vault.crt \
  "${LOCAL_CERT}"

echo "Done. Local cert updated at: ${LOCAL_CERT}"
