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

echo "Generating SSL certificates for *.vigilant-broccoli.app..."
mkcert -cert-file "$CERT_DIR/app.crt" \
       -key-file "$CERT_DIR/app.key" \
       "*.vigilant-broccoli.app" \
       vigilant-broccoli.app

echo "Certificates generated successfully!"
