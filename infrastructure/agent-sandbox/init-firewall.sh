#!/bin/bash
set -euo pipefail

ALLOWED_DOMAINS="registry.npmjs.org pypi.org files.pythonhosted.org api.anthropic.com api.openai.com auth.openai.com chatgpt.com claude.ai console.anthropic.com statsig.anthropic.com statsig.com sentry.io mise.jdx.dev mise-versions.jdx.dev releases.hashicorp.com nodejs.org objects.githubusercontent.com release-assets.githubusercontent.com $*"
DEV_PORTS=3000,4200,8080
IPSET_NAME=allowed-hosts

iptables -P INPUT ACCEPT
iptables -P OUTPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -F
ipset destroy $IPSET_NAME 2>/dev/null || true
ipset create $IPSET_NAME hash:net

# Unauthenticated /meta shares the host IP's 60-per-hour rate limit, so on a
# busy Actions runner it can 403. A failure inside the loop's command
# substitution would not trip `set -e`, silently allowing no GitHub CIDRs.
META_AUTH=()
[ -n "${GH_TOKEN:-}" ] && META_AUTH=(-H "Authorization: Bearer $GH_TOKEN")
GITHUB_CIDRS=$(curl -fsSL "${META_AUTH[@]}" https://api.github.com/meta | jq -r '(.web + .api + .git)[]' | grep -v ':')
for cidr in $GITHUB_CIDRS; do
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
# Docker Desktop can resolve the host outside the bridge subnet. Permit only
# the selected Ollama port there, rather than disabling the egress firewall.
if [ -n "${OLLAMA_BASE_URL:-}" ]; then
  OLLAMA_PORT=${OLLAMA_BASE_URL##*:}
  for host_ip in $(getent ahostsv4 host.docker.internal | awk '{print $1}' | sort -u); do
    iptables -A OUTPUT -p tcp -d "$host_ip" --dport "$OLLAMA_PORT" -j ACCEPT
  done
fi
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
# Any HTTP answer proves the route is open. Without -f, a 403 from GitHub's
# unauthenticated per-IP rate limit (shared hosted-runner IPs exhaust it)
# no longer reads as the firewall blocking GitHub; only a failed connection does.
if ! curl -sS -o /dev/null --connect-timeout 10 https://api.github.com/zen; then
  echo "Firewall verification failed: api.github.com is unreachable" >&2
  exit 1
fi
echo "Firewall active: default-deny egress with allowlist ($ALLOWED_DOMAINS + GitHub CIDRs)"
