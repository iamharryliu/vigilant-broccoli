#!/bin/bash
set -euo pipefail

OCI_VM_IP=$(cd "$(dirname "$0")/../../../../terraform" && terraform output -raw rabbitmq_public_ip 2>/dev/null)
CONSUMER_ENV=$(ssh -i ~/.ssh/id_ed25519 "ubuntu@${OCI_VM_IP}" 'docker inspect email-consumer --format "{{range .Config.Env}}{{println .}}{{end}}"')
EMAIL_SERVICE_API_KEY=$(echo "$CONSUMER_ENV" | grep EMAIL_SERVICE_API_KEY | cut -d= -f2-)
EMAIL_SERVICE_URL=$(echo "$CONSUMER_ENV" | grep EMAIL_SERVICE_URL | cut -d= -f2-)

echo "=== RabbitMQ Email Pipeline Test ==="
echo ""
echo "OCI VM: ${OCI_VM_IP}"
echo "Email Service: ${EMAIL_SERVICE_URL}"
echo ""

echo "1. Testing vb-email-service direct..."
STATUS=$(ssh -i ~/.ssh/id_ed25519 "ubuntu@${OCI_VM_IP}" \
  "curl -s -o /dev/null -w '%{http_code}' -X POST '${EMAIL_SERVICE_URL}/send-email' \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: ${EMAIL_SERVICE_API_KEY}' \
  -d '{\"from\":\"Harry Liu <contact@harryliu.dev>\",\"to\":\"harryliu1995@gmail.com\",\"subject\":\"[Test] RabbitMQ Email Pipeline\",\"html\":\"<p>This is an automated pipeline test.</p>\"}'")

if [ "$STATUS" = "200" ]; then
  echo "   ✓ vb-email-service responded 200 — email sent"
else
  echo "   ✗ vb-email-service responded ${STATUS}"
  exit 1
fi

echo ""
echo "2. Checking email-consumer status..."
CONSUMER_LOG=$(ssh -i ~/.ssh/id_ed25519 "ubuntu@${OCI_VM_IP}" 'docker logs email-consumer --tail 5 2>&1')
echo "   Last 5 log lines:"
echo "$CONSUMER_LOG" | sed 's/^/   /'

echo ""
echo "=== Pipeline test complete ==="
