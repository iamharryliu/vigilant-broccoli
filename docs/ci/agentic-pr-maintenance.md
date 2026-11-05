# Agentic PR Maintenance

How `cron-agentic-pr-update` picks pull requests and bounds its retries.

- **Every open PR is considered**, except drafts and fork PRs (`isCrossRepository`), which the dispatched run cannot push to.
- **Operation per PR.** `mergeable` of `CONFLICTING` dispatches `resolve-conflicts` (a conflict wins over failing CI). Otherwise a PR with a settled failing check (`FAILURE`, `TIMED_OUT`, `STARTUP_FAILURE` or a failing/errored commit status) and no pending checks dispatches `fix-ci`. `UNKNOWN` mergeability (GitHub computes it lazily) and in-progress checks are skipped until a later run sees a settled value.
- **Attempt cap of 2.** Each dispatch first adds `agent-maintain-attempt-N` (N = highest existing attempt + 1), shared across both operations, so a failed dispatch still consumes an attempt. A PR labelled `agent-maintain-attempt-2` is skipped. Remove the attempt labels to reset a PR.
- **No per-run dispatch cap.** Every eligible PR is dispatched, oldest PR number first. Each runs `manual-agentic-pr-update` with the chosen `operation` and default inputs.
- **Nothing is merged.** The dispatched run pushes the fix to the PR branch; a human reviews and merges.
- **Auth is `GITHUB_TOKEN`** (`actions: write`, `pull-requests: write`), so no repo secret or Vault read is needed; the dispatched run does its own Vault and GitHub App auth.
- **Selection logic** lives in `.github/scripts/select-broken-prs.jq`. Check it offline with `gh pr list --state open --json number,isDraft,isCrossRepository,mergeable,labels,statusCheckRollup | jq -c --argjson max_attempts 2 -f .github/scripts/select-broken-prs.jq`.
