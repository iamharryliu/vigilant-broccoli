#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PUBLISH=$1
OLLAMA_MODEL=$2
OLLAMA_BASE_URL=$3
PROMPT=$4
shift 4
IDS=("$@")
IMAGE=vb-agent-sandbox

# Limit the bridge to the host's Ollama server, never a cloud inference endpoint.
if [[ ! "$OLLAMA_BASE_URL" =~ ^http://host\.docker\.internal:([0-9]+)$ ]] || [[ "$OLLAMA_MODEL" = *:cloud ]]; then
  echo "ERROR: local inference requires http://host.docker.internal:<port> and a local model tag." >&2
  exit 1
fi
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  echo "ERROR: --local is for a workstation with a native Ollama server." >&2
  exit 1
fi

# Build every time: the runner is copied into the image and local development
# must execute the current adapter, rather than an old cached image's scripts.
docker compose -f "$SCRIPT_DIR/docker-compose.yml" build
DOCKER_ARGS=(--add-host host.docker.internal:host-gateway)
export OLLAMA_MODEL OLLAMA_BASE_URL

docker run --rm "${DOCKER_ARGS[@]}" -e OLLAMA_BASE_URL -e OLLAMA_MODEL \
  --entrypoint bash "$IMAGE" -c '
    response=$(curl -fsS --connect-timeout 5 --max-time 30 \
      -H "Content-Type: application/json" \
      -d "$(jq -nc --arg model "$OLLAMA_MODEL" "{model: \$model}")" \
      "$OLLAMA_BASE_URL/api/show") || {
        echo "ERROR: Ollama is unreachable or the model is missing. Start Ollama on the host and pull $OLLAMA_MODEL; see infrastructure/agent-sandbox/README.md." >&2
        exit 1
      }
    echo "$response" | jq -e "(.remote_host == null) and (.remote_model == null)" >/dev/null || {
      echo "ERROR: Ollama cloud models are not allowed in local mode." >&2
      exit 1
    }
    echo "$response" | jq -e ".capabilities | index(\"tools\") != null" >/dev/null || {
      echo "ERROR: the selected Ollama model must support tools." >&2
      exit 1
    }
  '

if [ "$PUBLISH" = 1 ]; then
  if [ -z "${GH_TOKEN:-}" ]; then
    AGENT_RUNNER=ollama . "$SCRIPT_DIR/load-env-from-vault.sh"
  fi
  if [ -z "${GH_TOKEN:-}" ]; then
    echo "ERROR: --publish requires a GitHub token." >&2
    exit 1
  fi
fi

RESULT_DIR=$(mktemp -d /tmp/vb-local-solve.XXXXXX)
echo "Local solve results: $RESULT_DIR"
run_local() {
  local label=$1 mode=$2 task=$3 status=0
  local output_dir="$RESULT_DIR/$label"
  mkdir -p "$output_dir/repo"
  # Docker's agent UID differs from the macOS user and needs to clone here.
  chmod 777 "$output_dir/repo"
  local args=(
    --rm --init "${DOCKER_ARGS[@]}"
    --cap-add NET_ADMIN --cap-add NET_RAW
    -e SOLVE_AGENT=ollama -e OLLAMA_MODEL -e OLLAMA_BASE_URL
    -e SOLVE_PREVIEW="$((1 - PUBLISH))"
    -e META_FILE=/home/agent/vigilant-broccoli/.git/solve-meta.json
    -e SANDBOX_FIREWALL -e SANDBOX_ALLOWED_DOMAINS
    -v "$output_dir/repo:/home/agent/vigilant-broccoli"
  )
  [ "$PUBLISH" != 1 ] || args+=(-e GH_TOKEN -e AGENT_GH_APP_ID)
  docker run "${args[@]}" "$IMAGE" \
    bash /usr/local/bin/solve-todo-runner.sh "$mode" "$task" \
    2>&1 | tee "$output_dir/run.log" || status=${PIPESTATUS[0]}
  echo "Checkout retained: $output_dir/repo (exit $status)"
  echo "Metadata: $output_dir/repo/.git/solve-meta.json"
  return "$status"
}

if [ -n "$PROMPT" ]; then
  run_local prompt --prompt "$PROMPT"
else
  FAILED=0
  # One model instance on a laptop: don't compete for its context/KV memory.
  for id in "${IDS[@]}"; do
    if [[ ! "$id" =~ ^[0-9a-f]{6}$ ]]; then
      echo "ERROR: invalid TODO id: $id" >&2
      exit 1
    fi
    run_local "$id" --id "$id" || FAILED=1
  done
  exit "$FAILED"
fi
