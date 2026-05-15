#!/bin/bash

set -e

VB_EXPRESS_URL="https://vb-express.fly.dev"
PASS=0
FAIL=0

check() {
  local label="$1"
  local result="$2"
  if [ "$result" = "true" ]; then
    echo "✓ $label"
    PASS=$((PASS + 1))
  else
    echo "✗ $label"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== vb-express e2e tests ==="
echo ""

# --- /api/llm ---
echo "Testing /api/llm..."
LLM_RESPONSE=$(curl -s -X POST "${VB_EXPRESS_URL}/api/llm" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${VB_EXPRESS_API_KEY}" \
  -d '{
    "userPrompt": "What planet do humans live on? Reply with only the planet name, nothing else.",
    "model": "gpt-4o-mini"
  }')

echo "Response: $LLM_RESPONSE"

ANSWER=$(echo "$LLM_RESPONSE" | jq -r '.outputs[0]' | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')
check "llm returns expected answer (earth)" "$([ "$ANSWER" = "earth" ] && echo true || echo false)"

# --- Summary ---
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
