# Agentic PR Maintenance

How `cron-agentic-pr-update-resolve-conflicts` picks pull requests and bounds its retries.

- **Opt-in by label.** Only open, non-draft PRs carrying `agent-maintain` whose `mergeable` is `CONFLICTING` are considered. Unlabelled PRs are never touched. `UNKNOWN` (GitHub computes mergeability lazily) is skipped until a later run sees a settled value.
- **Attempt cap of 2.** Each dispatch first adds `agent-maintain-attempt-N` (N = highest existing attempt + 1), so a failed dispatch still consumes an attempt. A PR labelled `agent-maintain-attempt-2` is skipped. Remove the attempt labels to reset a PR.
- **At most 3 dispatches per run**, oldest PR number first. Each runs `manual-agentic-pr-update` with `operation: resolve-conflicts` and default inputs.
- **Nothing is merged.** The dispatched run pushes the resolution to the PR branch; a human reviews and merges.
- **Auth is `GITHUB_TOKEN`** (`actions: write`, `pull-requests: write`), so no repo secret or Vault read is needed; the dispatched run does its own Vault and GitHub App auth.
- **Selection logic** lives in `.github/scripts/select-conflicting-prs.jq`. Check it offline with `gh pr list --state open --json number,isDraft,mergeable,labels,headRefName | jq -c --argjson max_attempts 2 --argjson max_dispatches 3 -f .github/scripts/select-conflicting-prs.jq`.
