#!/bin/bash

set -e

VB_EXPRESS_URL="https://vb-express.fly.dev"
ENDPOINT="/api/llm"
FULL_URL="${VB_EXPRESS_URL}${ENDPOINT}"

echo "Testing vb-express security: ${FULL_URL}"
echo "Verifying endpoint rejects requests without x-api-key..."

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${FULL_URL}" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}')

echo "Response code: ${HTTP_CODE}"

if [ "${HTTP_CODE}" = "401" ] || [ "${HTTP_CODE}" = "403" ]; then
  echo "✓ Security check passed: endpoint correctly rejected unauthorized request"
  exit 0
elif [ "${HTTP_CODE}" = "000" ]; then
  echo "✗ Security check failed: unable to reach endpoint"
  exit 1
else
  echo "✗ Security check failed: endpoint returned ${HTTP_CODE} (expected 401 or 403)"
  echo "This indicates the endpoint may be accepting requests without proper authentication"
  exit 1
fi
