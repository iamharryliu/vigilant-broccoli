#!/bin/bash

set -e

EMAIL_SERVICE_URL="https://vb-email-service.fly.dev"
ENDPOINT="/send-email"
FULL_URL="${EMAIL_SERVICE_URL}${ENDPOINT}"

PAYLOAD='{"from":"test@test.com","to":"test@test.com","subject":"test","html":"test"}'
FAILED=0

echo "Testing email-service security: ${FULL_URL}"

echo ""
echo "Test 1: Verifying endpoint rejects requests without x-api-key..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${FULL_URL}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}")
echo "Response code: ${HTTP_CODE}"
if [ "${HTTP_CODE}" = "401" ] || [ "${HTTP_CODE}" = "403" ]; then
  echo "✓ Passed: endpoint correctly rejected request without api key"
elif [ "${HTTP_CODE}" = "000" ]; then
  echo "✗ Failed: unable to reach endpoint"
  FAILED=1
else
  echo "✗ Failed: endpoint returned ${HTTP_CODE} (expected 401 or 403)"
  FAILED=1
fi

echo ""
echo "Test 2: Verifying endpoint rejects requests with incorrect x-api-key..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${FULL_URL}" \
  -H "Content-Type: application/json" \
  -H "x-api-key: invalid-key-12345" \
  -d "${PAYLOAD}")
echo "Response code: ${HTTP_CODE}"
if [ "${HTTP_CODE}" = "401" ] || [ "${HTTP_CODE}" = "403" ]; then
  echo "✓ Passed: endpoint correctly rejected request with incorrect api key"
elif [ "${HTTP_CODE}" = "000" ]; then
  echo "✗ Failed: unable to reach endpoint"
  FAILED=1
else
  echo "✗ Failed: endpoint returned ${HTTP_CODE} (expected 401 or 403)"
  FAILED=1
fi

echo ""
if [ "${FAILED}" = "1" ]; then
  echo "✗ Security checks failed"
  exit 1
else
  echo "✓ All security checks passed"
  exit 0
fi
