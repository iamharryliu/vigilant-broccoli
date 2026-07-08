#!/bin/bash

set -e

SERVICE_NAME="${1:-}"
HOSTNAMES="${2:-}"
ORIGIN_IP="${3:-}"
CERT_EXPIRY_WARN_DAYS=14

if [ -z "${SERVICE_NAME}" ] || [ -z "${HOSTNAMES}" ]; then
  echo "Usage: $0 <service-name> <hostname[,hostname...]> [origin-ip]"
  exit 2
fi

FAILED=0
PRIMARY_HOSTNAME="${HOSTNAMES%%,*}"

check_hostname() {
  local hostname="$1"

  echo ""
  echo "--- ${hostname} ---"

  echo ""
  echo "Test 1: DNS resolves to a Cloudflare IP range"
  local resolved_ip
  resolved_ip=$(python3 -c "import socket; print(socket.gethostbyname('${hostname}'))" 2>/dev/null)
  if [ -z "${resolved_ip}" ]; then
    echo "✗ Failed: could not resolve ${hostname}"
    FAILED=1
  else
    echo "Resolved IP: ${resolved_ip}"
    local in_cf_range=0
    for cidr in $(curl -s --max-time 15 https://www.cloudflare.com/ips-v4); do
      if python3 -c "
import ipaddress, sys
sys.exit(0 if ipaddress.ip_address('${resolved_ip}') in ipaddress.ip_network('${cidr}') else 1)
" 2>/dev/null; then
        in_cf_range=1
        break
      fi
    done
    if [ "${in_cf_range}" = "1" ]; then
      echo "✓ Passed: ${resolved_ip} is within a Cloudflare IP range (proxied)"
    else
      echo "✗ Failed: ${resolved_ip} is not a Cloudflare IP — DNS may not be proxied, exposing the origin"
      FAILED=1
    fi
  fi

  echo ""
  echo "Test 2: Unauthenticated request is blocked by Access, not serving real content"
  local unauth_code
  unauth_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://${hostname}/") || unauth_code="000"
  if [ "${unauth_code}" = "302" ] || [ "${unauth_code}" = "403" ]; then
    echo "✓ Passed: unauthenticated request got HTTP ${unauth_code} (Access login/deny)"
  elif [ "${unauth_code}" = "000" ]; then
    echo "✗ Failed: unable to reach https://${hostname}/"
    FAILED=1
  else
    echo "✗ Failed: got HTTP ${unauth_code} (expected 302 or 403 from Access) — endpoint may not be protected"
    FAILED=1
  fi

  echo ""
  echo "Test 3: TLS certificate is valid and not expiring soon"
  local cert_end_date
  cert_end_date=$(echo | openssl s_client -servername "${hostname}" -connect "${hostname}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
  if [ -z "${cert_end_date}" ]; then
    echo "✗ Failed: could not retrieve TLS certificate"
    FAILED=1
  else
    local cert_end_epoch now_epoch days_left
    cert_end_epoch=$(date -d "${cert_end_date}" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "${cert_end_date}" +%s 2>/dev/null)
    now_epoch=$(date +%s)
    days_left=$(( (cert_end_epoch - now_epoch) / 86400 ))
    if [ "${days_left}" -lt 0 ]; then
      echo "✗ Failed: TLS certificate expired ${cert_end_date}"
      FAILED=1
    elif [ "${days_left}" -lt "${CERT_EXPIRY_WARN_DAYS}" ]; then
      echo "✗ Failed: TLS certificate expires in ${days_left} days (${cert_end_date})"
      FAILED=1
    else
      echo "✓ Passed: TLS certificate valid for ${days_left} more days (expires ${cert_end_date})"
    fi
  fi
}

echo "Checking ${SERVICE_NAME} Cloudflare Access security"

IFS=',' read -ra HOSTNAME_LIST <<< "${HOSTNAMES}"
for hostname in "${HOSTNAME_LIST[@]}"; do
  check_hostname "${hostname}"
done

echo ""
echo "--- origin ---"
echo ""
echo "Test 4: Origin IP not directly reachable"
if [ -z "${ORIGIN_IP}" ]; then
  echo "⊘ Skipped: no origin IP provided"
else
  ORIGIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 --connect-timeout 5 "https://${ORIGIN_IP}" -k -H "Host: ${PRIMARY_HOSTNAME}") || ORIGIN_CODE="000"
  if [ "${ORIGIN_CODE}" = "000" ]; then
    echo "✓ Passed: origin ${ORIGIN_IP} did not respond directly"
  else
    echo "✗ Failed: origin ${ORIGIN_IP} responded directly with HTTP ${ORIGIN_CODE} — bypasses Cloudflare Access"
    FAILED=1
  fi
fi

echo ""
if [ "${FAILED}" = "1" ]; then
  echo "✗ ${SERVICE_NAME} Cloudflare Access security checks failed"
  exit 1
fi
echo "✓ ${SERVICE_NAME} Cloudflare Access security checks passed"
