# Input: `collect-failing-workflows.sh` output, `{workflows, dispatches, open_prs}`.
# Args: `$max_attempts` (number) and `$marker` (the dispatch-prompt marker prefix).
# Emits `{selected, skipped}` for `cron-agentic-pr-create-fix-failing-actions`.
#
# A workflow is a candidate when its latest settled default-branch run (PR-event,
# cancelled and skipped runs ignored) failed. Each dispatched prompt starts with
# `[<marker>:<file>@<sha7>]`, which reaches the child run's title and the PR body,
# so the dispatch history is the attempt counter: dispatches made after the
# workflow's last success count, one per head SHA, and an open PR carrying the
# marker blocks another.
def events: ["push", "schedule", "workflow_dispatch", "repository_dispatch"];
def failed: IN("failure", "timed_out", "startup_failure");
def file: .path | split("/") | last;
# Agentic dispatch workflows would dispatch themselves in a loop.
def recursive: file | test("^(manual|cron)-agentic-");

def settled_runs:
  [.runs[] | select((.event | IN(events[])) and (.conclusion | IN("cancelled", "skipped", "neutral", null) | not))]
  | sort_by(.created_at) | reverse;

def classify($dispatches; $open_prs):
  file as $file
  | "[\($marker):\($file)@" as $prefix
  | settled_runs as $runs
  | ($runs[0] // null) as $latest
  | ([$runs[] | select(.conclusion == "success")][0].created_at // "") as $last_success
  | {workflow: $file, path, name}
  | if $latest == null then . + {skip: "no settled default-branch run"}
    elif ($latest.conclusion | failed | not) then . + {skip: "latest run \($latest.conclusion)"}
    else
      ($prefix + $latest.head_sha[0:7] + "]") as $key
      | [$dispatches[] | select((.display_title | contains($prefix)) and .created_at > $last_success)] as $attempts
      | ([$open_prs[] | select(.body // "" | contains($prefix)) | .number][0]) as $open_pr
      | . + {
          run_id: $latest.id,
          run_url: $latest.html_url,
          event: $latest.event,
          conclusion: $latest.conclusion,
          head_sha: $latest.head_sha,
          key: $key,
          attempts: ($attempts | length)
        }
      | if $open_pr != null then . + {skip: "open PR #\($open_pr) already targets it"}
        elif any($attempts[]; .display_title | contains($key)) then . + {skip: "already dispatched for \($latest.head_sha[0:7])"}
        elif .attempts >= $max_attempts then . + {skip: "\(.attempts) attempts since the last success"}
        else . end
    end;

.dispatches as $dispatches
| .open_prs as $open_prs
| [ .workflows[]
    | select((.path | startswith(".github/workflows/")) and .state == "active" and (recursive | not))
    | classify($dispatches; $open_prs)
  ]
| sort_by(.workflow)
| {
    selected: [.[] | select(has("skip") | not)],
    skipped: [.[] | select(has("skip") and has("run_id")) | {workflow, run_url, skip}]
  }
