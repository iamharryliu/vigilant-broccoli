#!/bin/bash
set -u

URLS=(
  https://staging-vb-express.fly.dev/
  https://api.harryliu.dev/
)
MAX_ATTEMPTS=3
REQUEST_TIMEOUT=20
RETRY_DELAY=3

warm_service() {
  local url=$1
  local attempt
  for ((attempt = 1; attempt <= MAX_ATTEMPTS; attempt++)); do
    if curl --fail --silent --show-error --location --output /dev/null --max-time "$REQUEST_TIMEOUT" "$url"; then
      return 0
    fi
    if ((attempt < MAX_ATTEMPTS)); then
      sleep "$RETRY_DELAY"
    fi
  done
  echo "::warning::Warm-up failed for $url; Upptime will still check it."
}

for url in "${URLS[@]}"; do
  warm_service "$url" &
done
wait
sleep "$RETRY_DELAY"
