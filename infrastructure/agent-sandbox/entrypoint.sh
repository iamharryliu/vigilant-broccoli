#!/bin/bash
set -euo pipefail

REPO_URL=https://github.com/iamharryliu/vigilant-broccoli.git
AGENT_USER=agent
REPO_DIR="/home/$AGENT_USER/vigilant-broccoli"
SCRIPT_MODES=""

if [ "$(id -u)" = "0" ]; then
  if [ "${SANDBOX_FIREWALL:-on}" != "off" ]; then
    /usr/local/bin/init-firewall.sh ${SANDBOX_ALLOWED_DOMAINS:-}
  fi
  export HOME="/home/$AGENT_USER" USER="$AGENT_USER" LOGNAME="$AGENT_USER"
  exec setpriv --reuid="$AGENT_USER" --regid="$AGENT_USER" --init-groups "$0" "$@"
fi

if [ ! -d "$REPO_DIR/.git" ]; then
  git clone "$REPO_URL" "$REPO_DIR"
  SCRIPT_MODES=$(git -C "$REPO_DIR" ls-files --stage -- setup/dotfiles/zsh/aliases setup/dotfiles/zsh/scripts)
else
  git -C "$REPO_DIR" pull --ff-only || true
fi

bash "$REPO_DIR/setup/linux/install.sh" -y

# Setup from the cloned ref may chmod tracked files through its symlinks.
# Restore only executable bits in a fresh clone so PR checkout stays clean.
if [ -n "$SCRIPT_MODES" ]; then
  while IFS=$'\t' read -r metadata path; do
    case "${metadata%% *}" in
      100644) chmod a-x "$REPO_DIR/$path" ;;
      100755) chmod a+x "$REPO_DIR/$path" ;;
    esac
  done <<< "$SCRIPT_MODES"
fi

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
