#!/bin/bash
# Sourced by every agentic runner so agent-written commit messages and PR titles
# satisfy the commit contract (capitalized, ending in a period) that the
# ci-pr-check commitlint job enforces. Agents sometimes truncate a message with
# an ellipsis or omit the period, so both are fixed here rather than trusted.

# The lint-staged hook needs a workspace install the sandbox clone does not
# have; run-pre-commit.sh formats changed files with Prettier instead.
# shellcheck disable=SC2034 # read by the runners that source this file
SKIP_COMMIT_HOOKS=lint-staged

normalize_commit_message() {
  local message=$1
  message=${message%"${message##*[![:space:]]}"}
  while [ "${message%…}" != "$message" ] || [ "${message%...}" != "$message" ] || [ "${message%.}" != "$message" ]; do
    message=${message%…}
    message=${message%...}
    message=${message%.}
    message=${message%"${message##*[![:space:]]}"}
  done
  [ -n "$message" ] || return 0
  printf '%s.' "${message^}"
}

# Prints nothing for a title without a <type>(<scope>): prefix so callers fall
# back to the commit subject instead of opening a PR the commit contract rejects.
normalize_pr_title() {
  local title=$1 prefix
  local pattern='^([a-z]+(\([^)]*\))?: )(.+)$'
  if [[ $title =~ $pattern ]]; then
    prefix=${BASH_REMATCH[1]}
    printf '%s%s' "$prefix" "$(normalize_commit_message "${BASH_REMATCH[3]}")"
  fi
}

# Prints $1 when commitlint accepts it as a PR title, else the conforming
# fallback $2 (default: a fixed chore subject), so no generated title reaches
# `gh pr create`/`gh pr edit` unlinted. A sandbox clone without a workspace
# install cannot run commitlint; the title is then passed through unchanged
# because the normalizers above are the only guard available.
guard_pr_title() {
  local title=$1 fallback=${2:-"chore: Complete agent task."} root status=0
  root=$(git rev-parse --show-toplevel) || { printf '%s' "$title"; return 0; }
  (cd "$root" && pnpm exec commitlint --version >/dev/null 2>&1) || {
    echo "commitlint unavailable; PR title was not linted." >&2
    printf '%s' "$title"
    return 0
  }
  printf '%s\n' "$title" | (cd "$root" && pnpm exec commitlint --config commitlint.config.mjs >/dev/null 2>&1) || status=$?
  if [ "$status" -eq 0 ]; then
    printf '%s' "$title"
  else
    echo "PR title failed commitlint; using fallback: $fallback" >&2
    printf '%s' "$fallback"
  fi
}

# Prints the PR_FILES:: marker write-pr-step-summary.sh renders as a changed-files
# table, listing what the run committed since $1. Runners without per-file agent
# summaries leave the summary column blank.
emit_pr_files() {
  printf 'PR_FILES::%s\n' "$(git --no-pager diff --name-only "$1" HEAD | jq -Rsc 'split("\n") | map(select(length > 0) | {file: ., summary: ""})')"
}
