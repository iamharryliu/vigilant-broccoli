#!/usr/bin/env bash
# Every CONTEXT.md needs an adjacent tracked AGENTS.md symlink to it, and every shared skill a
# tracked command symlink. Reads the git index (ls-files/cat-file), so it checks what is staged.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

STATUS=0

fail() {
  if [ -n "${GITHUB_ACTIONS:-}" ]; then
    echo "::error file=$1::$2"
  else
    echo "$1: $2" >&2
  fi
  STATUS=1
}

check_link() {
  if [ "$(git ls-files -s -- "$1" | cut -d' ' -f1)" != 120000 ]; then
    fail "$1" "missing, or not a tracked symlink"
  elif [ "$(git cat-file blob ":$1")" != "$2" ]; then
    fail "$1" "must point at $2"
  fi
}

while IFS= read -r ctx; do
  check_link "$(dirname "$ctx")/AGENTS.md" CONTEXT.md
done < <(git ls-files 'CONTEXT.md' '*/CONTEXT.md')

while IFS= read -r skill; do
  name=$(basename "$(dirname "$skill")")
  check_link "setup/dotfiles/.claude/commands/$name.md" "../../agent-skills/$name/SKILL.md"
done < <(git ls-files 'setup/dotfiles/agent-skills/*/SKILL.md')

exit "$STATUS"
