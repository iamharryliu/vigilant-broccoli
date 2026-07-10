#!/bin/bash
set -euo pipefail

REPO_URL=https://github.com/iamharryliu/vigilant-broccoli.git
REPO_DIR="$HOME/vigilant-broccoli"

if [ "${SANDBOX_FIREWALL:-on}" != "off" ]; then
  sudo /usr/local/bin/init-firewall.sh ${SANDBOX_ALLOWED_DOMAINS:-}
fi

if [ ! -d "$REPO_DIR/.git" ]; then
  git clone "$REPO_URL" "$REPO_DIR"
else
  git -C "$REPO_DIR" pull --ff-only || true
fi

bash "$REPO_DIR/setup/linux/install.sh" -y

CLAUDE_STATE="$HOME/.claude.json"
if [ -f "$CLAUDE_STATE" ]; then
  jq '.hasCompletedOnboarding = true | .bypassPermissionsModeAccepted = true' "$CLAUDE_STATE" > "$CLAUDE_STATE.tmp" && mv "$CLAUDE_STATE.tmp" "$CLAUDE_STATE"
else
  echo '{"hasCompletedOnboarding": true, "bypassPermissionsModeAccepted": true}' > "$CLAUDE_STATE"
fi

if [ -n "${GH_TOKEN:-}" ]; then
  git -C "$REPO_DIR" config credential.helper '!gh auth git-credential'
fi

echo "Sandbox ready: $REPO_DIR"
exec "$@"
