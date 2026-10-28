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

# Mirrors type-enum in commitlint.config.mjs. The sandbox clone has no workspace
# install to run commitlint itself, so the helpers below enforce its header rules.
COMMIT_TYPES='feat fix ci chore docs refactor enhancement security infrastructure'

# Prints "<type>(<scope>): <Message>." with a lower-case scope, or nothing for an
# unknown type or empty message so callers use their fixed fallback subject.
commit_header() {
  local type=$1 scope=${2,,} message
  case " $COMMIT_TYPES " in *" $type "*) ;; *) return 0 ;; esac
  message=$(normalize_commit_message "$3")
  [ -n "$message" ] || return 0
  printf '%s%s: %s' "$type" "${scope:+($scope)}" "$message"
}

# Prints nothing for a title commit_header cannot make conform, so callers fall
# back to the commit subject instead of opening a PR the commit contract rejects.
normalize_pr_title() {
  local pattern='^([a-z]+)(\(([^)]*)\))?: (.+)$'
  [[ $1 =~ $pattern ]] || return 0
  commit_header "${BASH_REMATCH[1]}" "${BASH_REMATCH[3]}" "${BASH_REMATCH[4]}"
}

# Prints the PR_FILES:: marker write-pr-step-summary.sh renders as a changed-files
# table, listing what the run committed since $1. Runners without per-file agent
# summaries leave the summary column blank.
emit_pr_files() {
  printf 'PR_FILES::%s\n' "$(git --no-pager diff --name-only "$1" HEAD | jq -Rsc 'split("\n") | map(select(length > 0) | {file: ., summary: ""})')"
}
