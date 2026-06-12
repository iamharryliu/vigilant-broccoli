#!/bin/bash

set -e

SERVICE_NAME="${1:-}"
SERVICE_URL="${2:-}"
PING_PATH="/api/__ping"

if [ -z "${SERVICE_NAME}" ] || [ -z "${SERVICE_URL}" ]; then
  echo "Usage: $0 <service-name> <service-url>"
  exit 2
fi

FULL_URL="${SERVICE_URL}${PING_PATH}"
FAILED=0

echo "Testing ${SERVICE_NAME} security: ${FULL_URL}"

echo ""
echo "Test 1: GET without x-api-key — expect 401"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${FULL_URL}")
echo "Response code: ${HTTP_CODE}"
if [ "${HTTP_CODE}" = "401" ] || [ "${HTTP_CODE}" = "403" ]; then
  echo "✓ Passed: rejected request without api key"
elif [ "${HTTP_CODE}" = "000" ]; then
  echo "✗ Failed: unable to reach ${FULL_URL}"
  FAILED=1
else
  echo "✗ Failed: got ${HTTP_CODE} (expected 401 or 403)"
  FAILED=1
fi

echo ""
echo "Test 2: GET with incorrect x-api-key — expect 401"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${FULL_URL}" \
  -H "x-api-key: invalid-key-12345")
echo "Response code: ${HTTP_CODE}"
if [ "${HTTP_CODE}" = "401" ] || [ "${HTTP_CODE}" = "403" ]; then
  echo "✓ Passed: rejected request with incorrect api key"
elif [ "${HTTP_CODE}" = "000" ]; then
  echo "✗ Failed: unable to reach ${FULL_URL}"
  FAILED=1
else
  echo "✗ Failed: got ${HTTP_CODE} (expected 401 or 403)"
  FAILED=1
fi

echo ""
if [ "${FAILED}" = "1" ]; then
  echo "✗ ${SERVICE_NAME} security checks failed"
  exit 1
fi
echo "✓ ${SERVICE_NAME} security checks passed"
