#!/bin/bash
# Runs the Jellyfin Pi playbook. Any extra arguments go straight to
# ansible-playbook (e.g. --check --diff, --tags jellyfin, --limit <host>).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

INVENTORY="inventory/hosts.yml"
if [ ! -f "$INVENTORY" ]; then
  echo "Missing ${INVENTORY}. Copy inventory/hosts.example.yml and inventory/host_vars/jellyfin-pi.example.yml, then fill them in." >&2
  exit 1
fi

if ! command -v ansible-playbook >/dev/null 2>&1; then
  echo "ansible-playbook not found. Install it with 'brew install ansible' (it is in setup/mac/Brewfile) or 'pipx install ansible-core'." >&2
  exit 1
fi

ansible-galaxy collection install -r requirements.yml >/dev/null

# The auth key is only needed the first time a Pi joins the tailnet; the
# playbook skips enrolment when the node is already up. Keep going without it
# so a routine converge run works with Vault unreachable.
if [ -z "${TS_AUTHKEY:-}" ]; then
  # Assigned inside the `if` on purpose: a command substitution that fails
  # under `set -e` would otherwise take the whole script down with it.
  if AUTHKEY_EXPORT=$(./load-tailscale-authkey.sh); then
    eval "$AUTHKEY_EXPORT"
  else
    echo "Continuing without TS_AUTHKEY — fine unless this Pi still needs to join the tailnet." >&2
  fi
fi
export TS_AUTHKEY="${TS_AUTHKEY:-}"

exec ansible-playbook playbook.yml "$@"
