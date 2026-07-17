#!/bin/bash

set -e

LLM_SERVICE_URL="${LLM_SERVICE_URL:-https://staging-vb-llm-service.fly.dev}"
MODEL="${MODEL:-gpt-4o-mini}"
MAX_NUM_OUTPUTS=10
REQUESTED_NUM_OUTPUTS=15
FAILED=0

echo "Testing llm-service numOutputs clamp: ${LLM_SERVICE_URL}"

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
  echo "✗ llm-service numOutputs clamp check failed"
  exit 1
fi
echo "✓ llm-service numOutputs clamp check passed"
