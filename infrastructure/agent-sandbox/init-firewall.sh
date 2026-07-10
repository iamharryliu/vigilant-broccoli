#!/bin/bash
set -euo pipefail

ALLOWED_DOMAINS="registry.npmjs.org api.anthropic.com claude.ai console.anthropic.com statsig.anthropic.com statsig.com sentry.io $*"
DEV_PORTS=3000,4200,8080
IPSET_NAME=allowed-hosts

iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -F
ipset destroy $IPSET_NAME 2>/dev/null || true
ipset create $IPSET_NAME hash:net

for cidr in $(curl -fsSL https://api.github.com/meta | jq -r '(.web + .api + .git)[]' | grep -v ':'); do
  ipset add $IPSET_NAME "$cidr" -exist
done

for domain in $ALLOWED_DOMAINS; do
  for ip in $(getent ahostsv4 "$domain" | awk '{print $1}' | sort -u); do
    ipset add $IPSET_NAME "$ip" -exist
  done
done

HOST_GATEWAY=$(ip route | awk '/default/ {print $3; exit}')
HOST_NETWORK=$(echo "$HOST_GATEWAY" | sed 's|\.[0-9]*$|.0/24|')

iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A INPUT -s "$HOST_NETWORK" -j ACCEPT
iptables -A OUTPUT -d "$HOST_NETWORK" -j ACCEPT
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT
iptables -A INPUT -p tcp -m multiport --dports $DEV_PORTS -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m set --match-set $IPSET_NAME dst -j ACCEPT

iptables -P INPUT DROP
iptables -P OUTPUT DROP
iptables -P FORWARD DROP

if curl -fsS --connect-timeout 5 https://example.com >/dev/null 2>&1; then
  echo "Firewall verification failed: example.com is reachable" >&2
  exit 1
fi
if ! curl -fsS --connect-timeout 10 https://api.github.com/zen >/dev/null; then
  echo "Firewall verification failed: api.github.com is unreachable" >&2
  exit 1
fi
echo "Firewall active: default-deny egress with allowlist ($ALLOWED_DOMAINS + GitHub CIDRs)"
