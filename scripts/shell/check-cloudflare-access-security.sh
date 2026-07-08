#!/bin/bash

set -e

SERVICE_NAME="${1:-}"
HOSTNAME="${2:-}"
ORIGIN_IP="${3:-}"
CERT_EXPIRY_WARN_DAYS=14

if [ -z "${SERVICE_NAME}" ] || [ -z "${HOSTNAME}" ]; then
  echo "Usage: $0 <service-name> <hostname> [origin-ip]"
  exit 2
fi

FAILED=0

echo "Checking ${SERVICE_NAME} (${HOSTNAME}) Cloudflare Access security"

echo ""
echo "Test 1: DNS resolves to a Cloudflare IP range"
RESOLVED_IP=$(python3 -c "import socket; print(socket.gethostbyname('${HOSTNAME}'))" 2>/dev/null)
if [ -z "${RESOLVED_IP}" ]; then
  echo "✗ Failed: could not resolve ${HOSTNAME}"
  FAILED=1
else
  echo "Resolved IP: ${RESOLVED_IP}"
  IN_CF_RANGE=0
  for cidr in $(curl -s --max-time 15 https://www.cloudflare.com/ips-v4); do
    if command -v python3 >/dev/null 2>&1 && python3 -c "
import ipaddress, sys
sys.exit(0 if ipaddress.ip_address('${RESOLVED_IP}') in ipaddress.ip_network('${cidr}') else 1)
" 2>/dev/null; then
      IN_CF_RANGE=1
      break
    fi
  done
  if [ "${IN_CF_RANGE}" = "1" ]; then
    echo "✓ Passed: ${RESOLVED_IP} is within a Cloudflare IP range (proxied)"
  else
    echo "✗ Failed: ${RESOLVED_IP} is not a Cloudflare IP — DNS may not be proxied, exposing the origin"
    FAILED=1
  fi
fi

echo ""
echo "Test 2: Origin IP not directly reachable"
if [ -z "${ORIGIN_IP}" ]; then
  echo "⊘ Skipped: no origin IP provided"
else
  ORIGIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 --connect-timeout 5 "https://${ORIGIN_IP}" -k -H "Host: ${HOSTNAME}") || ORIGIN_CODE="000"
  if [ "${ORIGIN_CODE}" = "000" ]; then
    echo "✓ Passed: origin ${ORIGIN_IP} did not respond directly"
  else
    echo "✗ Failed: origin ${ORIGIN_IP} responded directly with HTTP ${ORIGIN_CODE} — bypasses Cloudflare Access"
    FAILED=1
  fi
fi

echo ""
echo "Test 3: Unauthenticated request is blocked by Access, not serving real content"
UNAUTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://${HOSTNAME}/") || UNAUTH_CODE="000"
if [ "${UNAUTH_CODE}" = "302" ] || [ "${UNAUTH_CODE}" = "403" ]; then
  echo "✓ Passed: unauthenticated request got HTTP ${UNAUTH_CODE} (Access login/deny)"
elif [ "${UNAUTH_CODE}" = "000" ]; then
  echo "✗ Failed: unable to reach https://${HOSTNAME}/"
  FAILED=1
else
  echo "✗ Failed: got HTTP ${UNAUTH_CODE} (expected 302 or 403 from Access) — endpoint may not be protected"
  FAILED=1
fi

echo ""
echo "Test 4: TLS certificate is valid and not expiring soon"
CERT_END_DATE=$(echo | openssl s_client -servername "${HOSTNAME}" -connect "${HOSTNAME}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -z "${CERT_END_DATE}" ]; then
  echo "✗ Failed: could not retrieve TLS certificate"
  FAILED=1
else
  CERT_END_EPOCH=$(date -d "${CERT_END_DATE}" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "${CERT_END_DATE}" +%s 2>/dev/null)
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (CERT_END_EPOCH - NOW_EPOCH) / 86400 ))
  if [ "${DAYS_LEFT}" -lt 0 ]; then
    echo "✗ Failed: TLS certificate expired ${CERT_END_DATE}"
    FAILED=1
  elif [ "${DAYS_LEFT}" -lt "${CERT_EXPIRY_WARN_DAYS}" ]; then
    echo "✗ Failed: TLS certificate expires in ${DAYS_LEFT} days (${CERT_END_DATE})"
    FAILED=1
  else
    echo "✓ Passed: TLS certificate valid for ${DAYS_LEFT} more days (expires ${CERT_END_DATE})"
  fi
fi

echo ""
if [ "${FAILED}" = "1" ]; then
  echo "✗ ${SERVICE_NAME} Cloudflare Access security checks failed"
  exit 1
fi
echo "✓ ${SERVICE_NAME} Cloudflare Access security checks passed"
