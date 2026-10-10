#!/bin/bash
# Sourced by every agentic runner so agent-written commit messages and PR titles
# satisfy the commit contract (capitalized, ending in a period) that the
# ci-pr-check commitlint job enforces. Agents sometimes truncate a message with
# an ellipsis or omit the period, so both are fixed here rather than trusted.

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

normalize_pr_title() {
  local title=$1 prefix
  local pattern='^([a-z]+(\([^)]*\))?: )(.+)$'
  if [[ $title =~ $pattern ]]; then
    prefix=${BASH_REMATCH[1]}
    printf '%s%s' "$prefix" "$(normalize_commit_message "${BASH_REMATCH[3]}")"
  else
    printf '%s' "$title"
  fi
}
