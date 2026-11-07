# Agentic PR Maintenance

How `cron-agentic-pr-update` picks pull requests and bounds its retries.

- **Every open PR is considered**, except drafts and fork PRs (`isCrossRepository`), which the dispatched run cannot push to.
- **Operation per PR.** `mergeable` of `CONFLICTING` dispatches `resolve-conflicts` (a conflict wins over failing CI). Otherwise a PR with a settled failing check (`FAILURE`, `TIMED_OUT`, `STARTUP_FAILURE` or a failing/errored commit status) and no pending checks dispatches `fix-ci`. GitHub computes mergeability lazily, so the first listing after a quiet period returns `UNKNOWN` for many PRs; the workflow re-lists up to `MERGEABLE_RETRIES` (5) times, `MERGEABLE_RETRY_DELAY` (10) seconds apart, until none are `UNKNOWN`. PRs still `UNKNOWN` after that, and PRs with in-progress checks, are skipped until a later run.
- **Per-PR log.** Each run logs every open PR's mergeability, draft/fork flags, check states and labels before selecting, so a skipped PR's reason is visible in the run output.
- **Attempt cap of 2.** Each dispatch first adds `agent-maintain-attempt-N` (N = highest existing attempt + 1), shared across both operations, so a failed dispatch still consumes an attempt. A PR labelled `agent-maintain-attempt-2` is skipped. Remove the attempt labels to reset a PR.
- **No per-run dispatch cap.** Every eligible PR is dispatched, oldest PR number first. Each runs `manual-agentic-pr-update` with the chosen `operation` and default inputs.
- **QA row conflicts.** Parallel PRs that fold checks into the same `TODO.md` [QA row](../todo-pattern.md#qa-rows) conflict on that line; `resolve-conflicts` handles them like any other conflict, keeping both sides' checks and PR links.
- **Nothing is merged.** The dispatched run pushes the fix to the PR branch; a human reviews and merges.
- **Auth is `GITHUB_TOKEN`** (`actions: write`, `pull-requests: write`), so no repo secret or Vault read is needed; the dispatched run does its own Vault and GitHub App auth.
- **Selection logic** lives in `.github/scripts/select-broken-prs.jq`. Check it offline with `gh pr list --state open --json number,isDraft,isCrossRepository,mergeable,labels,statusCheckRollup | jq -c --argjson max_attempts 2 -f .github/scripts/select-broken-prs.jq`.
