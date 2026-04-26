#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
NX_DIR="$REPO_DIR/projects/nx-workspace"

PASS=0
FAIL=0

check() {
  local name="$1"
  local status="$2"
  if [ "$status" = "ok" ]; then
    echo "  ✓ $name"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $name — $status"
    FAIL=$((FAIL + 1))
  fi
}

http_check() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$url" 2>/dev/null) || code="timeout"
  if [ "$code" = "$expected" ]; then
    check "$name" "ok"
  else
    check "$name" "HTTP $code (expected $expected)"
  fi
}

echo "=== Infrastructure Health Check ==="
echo ""

echo "[Fly.io Apps]"
http_check "vb-express" "https://vb-express.fly.dev"
http_check "vb-email-service" "https://vb-email-service.fly.dev"

echo ""
echo "[Websites]"
http_check "harryliu.dev" "https://harryliu.dev"
http_check "cloud8skate.com" "https://cloud8skate.com"
http_check "vb-next-demo.vercel.app" "https://vb-next-demo.vercel.app"

echo ""
echo "[OCI VM — RabbitMQ]"
OCI_VM_IP="${OCI_VM_IP:-}"
if [ -z "$OCI_VM_IP" ]; then
  OCI_VM_IP=$(cd "$REPO_DIR/terraform" && terraform output -raw rabbitmq_public_ip 2>/dev/null) || true
fi
if [ -n "$OCI_VM_IP" ]; then
  CONTAINERS=$(ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 "ubuntu@${OCI_VM_IP}" \
    'docker ps --format "{{.Names}}:{{.Status}}" 2>/dev/null' 2>/dev/null) || CONTAINERS=""
  if [ -n "$CONTAINERS" ]; then
    for container in rabbitmq email-consumer watchtower; do
      status=$(echo "$CONTAINERS" | grep "^${container}:" | cut -d: -f2- || true)
      if echo "$status" | grep -q "Up"; then
        check "container: $container" "ok"
      else
        check "container: $container" "${status:-not found}"
      fi
    done
  else
    check "OCI VM SSH" "connection failed"
  fi
else
  check "OCI VM" "IP not available (no terraform output)"
fi

echo ""
echo "[RabbitMQ Connection]"
GCP_PROJECT="${GCP_PROJECT:-vigilant-broccoli}"
RABBITMQ_CONNECTION_STRING=$(gcloud secrets versions access latest --secret=RABBITMQ_CONNECTION_STRING --project="$GCP_PROJECT" 2>/dev/null) || RABBITMQ_CONNECTION_STRING=""
RABBITMQ_CA_CERT=$(gcloud secrets versions access latest --secret=RABBITMQ_CA_CERT --project="$GCP_PROJECT" 2>/dev/null) || RABBITMQ_CA_CERT=""
if [ -n "$RABBITMQ_CONNECTION_STRING" ]; then
  rmq_result=$(NODE_PATH="$NX_DIR/node_modules" RABBITMQ_CONNECTION_STRING="$RABBITMQ_CONNECTION_STRING" RABBITMQ_CA_CERT="$RABBITMQ_CA_CERT" node -e "
    const amqplib = require('amqplib');
    const caCert = process.env.RABBITMQ_CA_CERT;
    const socketOptions = caCert
      ? { ca: [Buffer.from(caCert, 'base64')], checkServerIdentity: () => undefined, servername: 'rabbitmq' }
      : undefined;
    (async () => {
      const conn = await amqplib.connect(process.env.RABBITMQ_CONNECTION_STRING, socketOptions);
      const ch = await conn.createChannel();
      const q = await ch.checkQueue('EMAIL');
      console.log('ok:' + q.messageCount + ':' + q.consumerCount);
      await conn.close();
    })().catch(e => console.log('fail:' + e.message));
  " 2>/dev/null) || rmq_result="fail:node error"
  if echo "$rmq_result" | grep -q "^ok:"; then
    msg_count=$(echo "$rmq_result" | cut -d: -f2)
    consumer_count=$(echo "$rmq_result" | cut -d: -f3)
    check "rabbitmq broker (messages: $msg_count, consumers: $consumer_count)" "ok"
  else
    err=$(echo "$rmq_result" | cut -d: -f2-)
    check "rabbitmq broker" "$err"
  fi
else
  check "rabbitmq broker" "failed to fetch secrets from GCP Secret Manager"
fi

echo ""
echo "[GCP VM — Vault]"
GCP_VAULT_URL="${GCP_VAULT_URL:-https://10.0.1.1:8200}"
vault_status=$(curl -k -s --max-time 10 "${GCP_VAULT_URL}/v1/sys/health" 2>/dev/null) || vault_status=""
if [ -n "$vault_status" ]; then
  sealed=$(echo "$vault_status" | grep -o '"sealed":[a-z]*' | cut -d: -f2)
  initialized=$(echo "$vault_status" | grep -o '"initialized":[a-z]*' | cut -d: -f2)
  if [ "$sealed" = "false" ] && [ "$initialized" = "true" ]; then
    check "vault" "ok"
  elif [ "$sealed" = "true" ]; then
    check "vault" "sealed"
  else
    check "vault" "initialized=$initialized sealed=$sealed"
  fi
else
  check "vault" "unreachable (requires VPN/tunnel)"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
