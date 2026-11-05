#!/bin/bash

set -e

CACHE_URL="${1:-}"
WRITE_TOKEN="${NX_CACHE_WRITE_TOKEN:-}"

if [ -z "${CACHE_URL}" ] || [ -z "${WRITE_TOKEN}" ]; then
  echo "Usage: NX_CACHE_WRITE_TOKEN=<token> $0 <cache-url>"
  exit 2
fi

# Alphanumeric to match the Worker's key pattern, and never a real Nx hash
# (those are numeric), so the probe can't collide with a trusted entry. The
# entry it writes is a few bytes and expires with the bucket lifecycle rule.
PROBE_KEY="securityprobe$(date +%s)${RANDOM}"
PROBE_URL="${CACHE_URL}/v1/cache/${PROBE_KEY}"
FAILED=0

expect_code() {
  local description="$1"
  local expected="$2"
  shift 2
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$@") || http_code="000"
  echo ""
  echo "${description} — expect ${expected}"
  echo "Response code: ${http_code}"
  if [ "${http_code}" = "${expected}" ]; then
    echo "✓ Passed"
  elif [ "${http_code}" = "000" ]; then
    echo "✗ Failed: unable to reach ${CACHE_URL}"
    FAILED=1
  else
    echo "✗ Failed: got ${http_code} (expected ${expected})"
    FAILED=1
  fi
}

echo "Testing nx-cache security: ${CACHE_URL}"

expect_code "Test 1: GET /health" 200 "${CACHE_URL}/health"
expect_code "Test 2: GET without token" 401 "${PROBE_URL}"
expect_code "Test 3: PUT without token" 401 -X PUT --data-binary 'probe' "${PROBE_URL}"
expect_code "Test 4: GET with incorrect token" 401 -H "Authorization: Bearer invalid-token-12345" "${PROBE_URL}"
expect_code "Test 5: PUT with incorrect token" 401 -X PUT --data-binary 'probe' \
  -H "Authorization: Bearer invalid-token-12345" "${PROBE_URL}"
expect_code "Test 6: PUT a new key with the write token" 200 -X PUT --data-binary 'probe' \
  -H "Authorization: Bearer ${WRITE_TOKEN}" "${PROBE_URL}"
# Immutable writes are the CREEP fix: an existing entry must never be replaced.
expect_code "Test 7: PUT the same key again with the write token" 409 -X PUT --data-binary 'poisoned' \
  -H "Authorization: Bearer ${WRITE_TOKEN}" "${PROBE_URL}"

echo ""
if [ "${FAILED}" = "1" ]; then
  echo "✗ nx-cache security checks failed"
  exit 1
fi
echo "✓ nx-cache security checks passed"
