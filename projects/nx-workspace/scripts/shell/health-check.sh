#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
NX_DIR="$REPO_DIR/projects/nx-workspace"
GCP_PROJECT="${GCP_PROJECT:-vigilant-broccoli}"

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

HC_TMPDIR="$(mktemp -d)"
trap 'rm -rf "$HC_TMPDIR"' EXIT

# Runs in a background job; result is written to a file so the parent shell
# can tally PASS/FAIL after `wait`, since background subshells can't mutate them.
http_check_bg() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"
  local outfile="$4"
  local code
  # Retry to tolerate scale-to-zero cold starts (first request wakes the service).
  for attempt in 1 2 3; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$url" 2>/dev/null) || code="timeout"
    [ "$code" = "$expected" ] && break
    [ "$attempt" -lt 3 ] && sleep 5
  done
  if [ "$code" = "$expected" ]; then
    echo "ok" > "$outfile"
  else
    echo "HTTP $code (expected $expected)" > "$outfile"
  fi
}

declare -a HC_NAMES=()
declare -a HC_FILES=()

queue_http_check() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"
  local outfile="$HC_TMPDIR/${#HC_NAMES[@]}"
  HC_NAMES+=("$name")
  HC_FILES+=("$outfile")
  http_check_bg "$name" "$url" "$expected" "$outfile" &
}

print_http_check() {
  check "${HC_NAMES[$1]}" "$(cat "${HC_FILES[$1]}")"
}

echo "=== Infrastructure Health Check ==="
echo ""

queue_http_check "staging-vb-express" "https://staging-vb-express.fly.dev"
queue_http_check "staging-vb-email-service" "https://staging-vb-email-service.fly.dev"
queue_http_check "staging-vb-llm-service" "https://staging-vb-llm-service.fly.dev"
queue_http_check "staging-vb-storage-service" "https://staging-vb-storage-service.fly.dev"
queue_http_check "staging-email-subscription-service" "https://staging-email-subscription-service.fly.dev"
FLY_COUNT=${#HC_NAMES[@]}

queue_http_check "harryliu.dev" "https://harryliu.dev"
queue_http_check "cloud8skate.com" "https://cloud8skate.com"
queue_http_check "staging-hearth" "https://staging-hearth.vercel.app"
queue_http_check "findme" "https://findme-kohl.vercel.app"
queue_http_check "git.harryliu.dev" "https://git.harryliu.dev"

wait

echo "[Fly.io Apps]"
for ((i = 0; i < FLY_COUNT; i++)); do
  print_http_check "$i"
done

echo ""
echo "[Websites]"
for ((i = FLY_COUNT; i < ${#HC_NAMES[@]}; i++)); do
  print_http_check "$i"
done

echo ""
echo "[GCP VM]"
VM_STATUS=$(gcloud compute instances describe vb-free-vm --zone=us-central1-a --format='value(status)' 2>/dev/null) || VM_STATUS="unknown"
if [ "$VM_STATUS" = "RUNNING" ]; then
  check "vb-free-vm" "ok"
else
  check "vb-free-vm" "$VM_STATUS"
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
echo "[OCI VM — Containers]"
OCI_VM_IP="${OCI_VM_IP:-}"
if [ -z "$OCI_VM_IP" ]; then
  OCI_VM_IP=$(cd "$REPO_DIR/infrastructure/terraform" && terraform output -raw oci_vm_public_ip 2>/dev/null) || true
fi
if [ -n "$OCI_VM_IP" ]; then
  CONTAINERS=$(ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 "ubuntu@${OCI_VM_IP}" \
    'docker ps --format "{{.Names}}:{{.Status}}" 2>/dev/null' 2>/dev/null) || CONTAINERS=""
  if [ -n "$CONTAINERS" ]; then
    for container in rabbitmq watchtower; do
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
echo "[OCI VM — RabbitMQ Connection]"
VAULT_TOKEN=$(gcloud secrets versions access latest --secret=VB_VM_VAULT_ROOT_TOKEN --project="$GCP_PROJECT" 2>/dev/null) || VAULT_TOKEN=""
if [ -n "$VAULT_TOKEN" ]; then
  vault_secrets=$(curl -k -s --max-time 10 \
    -H "X-Vault-Token: $VAULT_TOKEN" \
    "${GCP_VAULT_URL}/v1/kv/data/secrets" 2>/dev/null) || vault_secrets=""
  RABBITMQ_CONNECTION_STRING=$(echo "$vault_secrets" | grep -o '"RABBITMQ_CONNECTION_STRING":"[^"]*"' | cut -d'"' -f4) || RABBITMQ_CONNECTION_STRING=""
  RABBITMQ_CA_CERT=$(echo "$vault_secrets" | grep -o '"RABBITMQ_CA_CERT":"[^"]*"' | cut -d'"' -f4) || RABBITMQ_CA_CERT=""
else
  RABBITMQ_CONNECTION_STRING=""
  RABBITMQ_CA_CERT=""
fi
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
  check "rabbitmq broker" "failed to fetch secrets from Vault (token: ${VAULT_TOKEN:+present}, vault reachable: ${vault_secrets:+yes})"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
