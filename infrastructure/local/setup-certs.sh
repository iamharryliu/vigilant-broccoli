#!/bin/bash

set -e

CERT_DIR="./certs"

if [ ! -d "$CERT_DIR" ]; then
    mkdir -p "$CERT_DIR"
fi

if ! command -v mkcert &> /dev/null; then
    echo "mkcert not found. Installing..."
    brew install mkcert
fi

LOCAL_DOMAIN="vigilant-broccoli.internal"

# Checks the SAN, not just the file, so a cert left over from an earlier local
# domain is replaced instead of silently kept.
if [ -f "$CERT_DIR/app.crt" ] && [ -f "$CERT_DIR/app.key" ] \
    && openssl x509 -in "$CERT_DIR/app.crt" -noout -text | grep -q "DNS:\*\.${LOCAL_DOMAIN}"; then
    echo "Certificates already exist, skipping."
else
    echo "Generating SSL certificates for *.${LOCAL_DOMAIN}..."
    mkcert -cert-file "$CERT_DIR/app.crt" \
           -key-file "$CERT_DIR/app.key" \
           "*.${LOCAL_DOMAIN}" \
           "${LOCAL_DOMAIN}"

    echo "Certificates generated successfully!"
fi
