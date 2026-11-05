# Input: `gh pr list --json number,isDraft,isCrossRepository,mergeable,labels,statusCheckRollup` output.
# Emits `{number, operation, attempts}` for the PRs `cron-agentic-pr-update` may dispatch,
# oldest first. `mergeable` is computed lazily by GitHub, so UNKNOWN is not treated as
# conflicting until a later run sees a settled value. A conflict wins over failing CI,
# since a conflicting branch cannot be fixed or checked meaningfully until it is merged.
def attempts:
  [.labels[].name | capture("^agent-maintain-attempt-(?<n>[0-9]+)$").n | tonumber] | (max // 0);

# CheckRun nodes carry status/conclusion; StatusContext nodes carry state.
def pending: .status == "IN_PROGRESS" or .status == "QUEUED" or .status == "PENDING" or .status == "WAITING" or .state == "PENDING" or .state == "EXPECTED";
def failed: (.conclusion | IN("FAILURE", "TIMED_OUT", "STARTUP_FAILURE")) or (.state | IN("FAILURE", "ERROR"));

def operation:
  if .mergeable == "CONFLICTING" then "resolve-conflicts"
  elif (.statusCheckRollup // []) as $checks | ($checks | any(failed)) and ($checks | any(pending) | not) then "fix-ci"
  else empty end;

[ .[]
  | select(.isDraft == false and .isCrossRepository == false)
  | select(attempts < $max_attempts)
  | operation as $operation
  | {number, operation: $operation, attempts: attempts}
]
| sort_by(.number)
