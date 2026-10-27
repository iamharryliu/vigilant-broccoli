#!/bin/bash
# `agentic-pr-create --vm`: solves in the code-server container on the OCI VM
# instead of local Docker sandboxes. solve-vm-session.sh starts one detached
# tmux session per request there, so this returns once they are running.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
AGENT=$1
MODEL=$2
CODEX_MODEL=$3
PROMPT=$4
shift 4
IDS=("$@")
OCI_SSH="$REPO_ROOT/scripts/shell/oci-ssh.sh"
VM_IP_OUTPUT=oci_code_server_public_ip
TOKEN_FILE=/opt/code-server/secrets/gh-token.json

if [ -n "${GITHUB_ACTIONS:-}" ]; then
  echo "ERROR: --vm is a workstation entry point; Actions runs manual-agentic-pr-create." >&2
  exit 1
fi

REQUESTS=()
if [ -n "$PROMPT" ]; then
  REQUESTS=(--prompt "$PROMPT")
else
  for id in "${IDS[@]}"; do
    grep -qE "^\|[[:space:]]*${id}[[:space:]]*\|" "$REPO_ROOT/TODO.md" || echo "WARNING: no '${id}' row in local TODO.md (the VM solves fresh main)" >&2
    REQUESTS+=(--id "$id")
  done
fi

# The VM never holds the GitHub App key, so each launch delivers a fresh
# 1-hour installation token to the file the container's gh wrapper reads. All
# sessions share that file, so a later launch also extends earlier runs.
AGENT_RUNNER=$AGENT . "$SCRIPT_DIR/load-env-from-vault.sh"
if [ -z "${GH_TOKEN:-}" ]; then
  echo "ERROR: no GitHub token available — solves cannot push or open PRs." >&2
  exit 1
fi
echo "Delivering a fresh GitHub App token to the code-server VM..." >&2
jq -n --arg token "$GH_TOKEN" --argjson expires_at "$(($(date +%s) + 3600))" '{token: $token, expires_at: $expires_at}' \
  | "$OCI_SSH" "$VM_IP_OUTPUT" "sudo install -m 0600 -o 1000 -g 1000 /dev/stdin $TOKEN_FILE"

# The Codex access token rides the same SSH stdin as the session script, as a
# variable assignment prepended to it: never argv (visible in ps) and never
# Terraform state or cloud-init. solve-vm-session.sh hands it to each run
# through a 0600 file that run_solve deletes before the runner starts.
printf -v SESSION_ARGS '%q ' "$AGENT" "$MODEL" "$CODEX_MODEL" "${REQUESTS[@]}"
{
  [ "$AGENT" != codex ] || printf 'AGENT_CODEX_ACCESS_TOKEN=%q\n' "$AGENT_CODEX_ACCESS_TOKEN"
  cat "$SCRIPT_DIR/solve-vm-session.sh"
} | "$OCI_SSH" "$VM_IP_OUTPUT" \
  "sudo docker exec -i -u abc -e HOME=/config -w /config code-server bash -s -- $SESSION_ARGS"
