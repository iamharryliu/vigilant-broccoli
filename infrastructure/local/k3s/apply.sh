#!/bin/bash
set -euo pipefail

CONTEXT=k3d-vb-local
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$LOCAL_DIR"
./setup-certs.sh

# Middleware is a Traefik CRD, registered only once k3s has installed the
# bundled traefik-crd chart, which takes a minute on a new cluster.
for _ in $(seq 1 60); do
  kubectl --context "$CONTEXT" get crd middlewares.traefik.io >/dev/null 2>&1 && break
  sleep 3
done

kubectl --context "$CONTEXT" apply -k k3s/manifests
kubectl --context "$CONTEXT" -n local-platform create secret tls local-tls \
  --cert certs/app.crt --key certs/app.key --dry-run=client -o yaml \
  | kubectl --context "$CONTEXT" apply -f -
