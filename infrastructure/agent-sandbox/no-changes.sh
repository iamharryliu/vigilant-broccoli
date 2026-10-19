#!/bin/bash
# Sourced, never run. A run that ends with no changes is a decision only when
# the agent said why: runners read the optional no_changes_reason from the
# agent's metadata file, and host scripts read the markers back from the run
# log. The reason is printed JSON-encoded so a multi-line reason stays on its
# one marker line.

NO_CHANGES_MARKER='RESULT::no-changes'
NO_CHANGES_REASON_PREFIX='NO_CHANGES_REASON::'

# shellcheck disable=SC2034 # read by the runners that source this file
NO_CHANGES_FIELD='  - no_changes_reason: only when you deliberately made no change, one or two sentences saying why (already done, out of scope, or the request should not be applied); omit it whenever you changed files'

no_changes_reason() {
  jq -r '.no_changes_reason // empty | strings' "$1" 2>/dev/null | sed '/^[[:space:]]*$/d' || true
}

# Prints the markers and returns 0 when the agent recorded a reason, else 1.
#   $1 metadata file
no_changes_report() {
  local reason
  reason=$(no_changes_reason "$1")
  [ -n "$reason" ] || return 1
  echo "$NO_CHANGES_MARKER"
  printf '%s%s\n' "$NO_CHANGES_REASON_PREFIX" "$(printf '%s' "$reason" | jq -Rsc .)"
  echo "The agent made no changes: $reason" >&2
}

# Without a reason the run still fails, so a crashed or confused agent is never
# reported as a decision.
#   $1 metadata file  $2 failure message
no_changes_exit() {
  no_changes_report "$1" && exit 0
  echo "ERROR: $2" >&2
  exit 1
}

# Host side: the decoded reason from a run log, or nothing.
no_changes_reason_in_log() {
  grep -qx "$NO_CHANGES_MARKER" "$1" 2>/dev/null || return 0
  { grep -m1 "^${NO_CHANGES_REASON_PREFIX}" "$1" || true; } | sed "s/^${NO_CHANGES_REASON_PREFIX}//" | jq -r . 2>/dev/null || true
}
