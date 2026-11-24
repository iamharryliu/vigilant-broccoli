#!/usr/bin/env bash
# Probes every staging-* site in .upptimerc.yml, the registry of public URLs, so
# a new staging URL is gated without touching this script.
#   expectedStatusCodes [302]  Access/Vercel-gated UI. Without a service token
#                              this only proves the gate answers; with
#                              CF_ACCESS_CLIENT_ID/SECRET it must reach the app.
#   no expectedStatusCodes     Public (staging API, Fly origins): must return 2xx.
set -uo pipefail

CONFIG=${1:-.upptimerc.yml}
ATTEMPTS=${ATTEMPTS:-4}
RETRY_DELAY=${RETRY_DELAY:-15}

sites=$(awk '
  function flush() { if (name ~ /^staging-/) print name "\t" url "\t" expected }
  /^  - name:/ { flush(); name=$3; url=""; expected=""; next }
  /^    url:/ { url=$2 }
  /^    expectedStatusCodes:/ { gsub(/[^0-9,]/, "", $2); expected=$2 }
  END { flush() }
' "$CONFIG")

probe() {
  local url=$1 expected=$2 auth=()
  [[ -n "${CF_ACCESS_CLIENT_ID:-}" && "$expected" == 302 ]] &&
    auth=(-H "CF-Access-Client-Id: ${CF_ACCESS_CLIENT_ID}" -H "CF-Access-Client-Secret: ${CF_ACCESS_CLIENT_SECRET}")
  local out status location
  out=$(curl -sS -o /dev/null -m 20 -w '%{http_code} %{redirect_url}' "${auth[@]}" "$url") || return 1
  status=${out%% *}
  location=${out#* }

  if [[ "$expected" == 302 && ${#auth[@]} -eq 0 ]]; then
    [[ "$status" == 302 ]]
  elif [[ "$expected" == 302 ]]; then
    # A redirect to the Access login means the token was rejected; any other
    # 2xx/3xx is the app answering (e.g. its own /login redirect).
    [[ "$status" =~ ^[23] && "$location" != *cloudflareaccess.com* ]]
  else
    [[ "$status" =~ ^2 ]]
  fi
}

failed=()
while IFS=$'\t' read -r name url expected; do
  ok=false
  for ((i = 1; i <= ATTEMPTS; i++)); do
    if probe "$url" "$expected"; then ok=true; break; fi
    sleep "$RETRY_DELAY"
  done
  if $ok; then echo "ok    $name $url"; else echo "FAIL  $name $url"; failed+=("$name"); fi
done <<<"$sites"

if ((${#failed[@]})); then
  echo "::error::staging verification failed: ${failed[*]}"
  exit 1
fi
