#!/bin/bash
# Deploys the org-wide Fly log shipper. Expects ACCESS_TOKEN and LOKI_PASSWORD
# in the environment — `pnpm logs:shipper:deploy` wraps this in
# fetch-secrets.ts, which maps them in from Vault, so the values never land
# in a file or in the pnpm script text.
set -euo pipefail

APP_NAME="vb-log-shipper"
FLY_ORG="personal"
CONFIG="deployment-configs/fly-configs/log-shipper.toml"

if [ -z "${ACCESS_TOKEN:-}" ] || [ -z "${LOKI_PASSWORD:-}" ]; then
  echo "deploy-log-shipper: ACCESS_TOKEN and LOKI_PASSWORD must be set (run via pnpm logs:shipper:deploy)" >&2
  exit 1
fi

if ! flyctl status --app "$APP_NAME" >/dev/null 2>&1; then
  flyctl apps create "$APP_NAME" --org "$FLY_ORG"
fi

flyctl secrets set --app "$APP_NAME" --stage \
  ACCESS_TOKEN="$ACCESS_TOKEN" \
  LOKI_PASSWORD="$LOKI_PASSWORD"

# --ha=false: one subscriber is enough and a second would double-ship.
flyctl deploy --config "$CONFIG" --app "$APP_NAME" --ha=false

# Reconcile ingress to none, after the deploy rather than before: some flyctl
# versions allocate a public IP during deploy. Nothing dials this app, so any
# address it holds is unused surface. Mirrors the privateOnly handling in
# deploy-flyio-secrets.ts, except this app needs no private ingress either.
for ip in $(flyctl ips list --app "$APP_NAME" --json | jq -r '.[].Address'); do
  echo "Releasing unused ingress $ip from $APP_NAME..."
  flyctl ips release "$ip" --app "$APP_NAME"
done
