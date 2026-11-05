# Input: `gh pr list --json number,isDraft,mergeable,labels,headRefName` output.
# Emits the PR numbers `cron-agentic-pr-update-resolve-conflicts` may dispatch,
# oldest first. `mergeable` is computed lazily by GitHub, so UNKNOWN is skipped
# until a later run sees a settled value.
def attempts:
  [.labels[].name | capture("^agent-maintain-attempt-(?<n>[0-9]+)$").n | tonumber] | (max // 0);

[ .[]
  | select(.isDraft == false)
  | select(.mergeable == "CONFLICTING")
  | select(any(.labels[]; .name == "agent-maintain"))
  | select(attempts < $max_attempts)
  | {number, attempts: attempts}
]
| sort_by(.number)
| .[:$max_dispatches]
