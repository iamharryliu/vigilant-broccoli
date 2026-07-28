#!/bin/bash

set -e

LLM_SERVICE_URL="${LLM_SERVICE_URL:-https://staging-vb-llm-service.fly.dev}"
MODEL="${MODEL:-gpt-4o-mini}"
MAX_NUM_OUTPUTS=10
REQUESTED_NUM_OUTPUTS=15
FAILED=0

PING_URL="${LLM_SERVICE_URL}/api/__ping"

echo "Testing llm-service security: ${LLM_SERVICE_URL}"

echo ""
echo "Test: GET /api/__ping without x-api-key — expect 401"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${PING_URL}")
echo "Response code: ${HTTP_CODE}"
if [ "${HTTP_CODE}" = "401" ] || [ "${HTTP_CODE}" = "403" ]; then
  echo "✓ Passed: rejected request without api key"
else
  echo "✗ Failed: got ${HTTP_CODE} (expected 401 or 403)"
  FAILED=1
fi

echo ""
echo "Test: GET /api/__ping with incorrect x-api-key — expect 401"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${PING_URL}" \
  -H "x-api-key: invalid-key-12345")
echo "Response code: ${HTTP_CODE}"
if [ "${HTTP_CODE}" = "401" ] || [ "${HTTP_CODE}" = "403" ]; then
  echo "✓ Passed: rejected request with incorrect api key"
else
  echo "✗ Failed: got ${HTTP_CODE} (expected 401 or 403)"
  FAILED=1
fi

echo ""
echo "Test: POST /api/llm with numOutputs=${REQUESTED_NUM_OUTPUTS} — expect <= ${MAX_NUM_OUTPUTS} outputs"
RESPONSE=$(curl -s -X POST "${LLM_SERVICE_URL}/api/llm" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${SHARED_APP_TOKEN}" \
  -d "{
    \"userPrompt\": \"Reply with only the word: ok\",
    \"model\": \"${MODEL}\",
    \"numOutputs\": ${REQUESTED_NUM_OUTPUTS}
  }")

echo "Response: ${RESPONSE}"

if echo "${RESPONSE}" | grep -q "credit balance"; then
  echo "✓ Passed: skipped (account credit balance too low)"
elif ! echo "${RESPONSE}" | jq -e '.outputs' >/dev/null 2>&1; then
  echo "✗ Failed: response did not contain an outputs array"
  FAILED=1
else
  OUTPUT_COUNT=$(echo "${RESPONSE}" | jq -r '.outputs | length')
  echo "Output count: ${OUTPUT_COUNT}"
  if [ "${OUTPUT_COUNT}" -le "${MAX_NUM_OUTPUTS}" ]; then
    echo "✓ Passed: numOutputs=${REQUESTED_NUM_OUTPUTS} was clamped to ${OUTPUT_COUNT} outputs"
  else
    echo "✗ Failed: got ${OUTPUT_COUNT} outputs (expected <= ${MAX_NUM_OUTPUTS})"
    FAILED=1
  fi
fi

echo ""
if [ "${FAILED}" = "1" ]; then
  echo "✗ llm-service security checks failed"
  exit 1
fi
echo "✓ llm-service security checks passed"
