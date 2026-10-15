---
name: agentic-pr-update-resolve-conflicts
description: In vigilant-broccoli, merge origin/main into a PR branch and resolve conflicts while preserving both sides.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Merge `origin/main` into a PR number/URL, preserving both sides' intent.

1. Locally, follow `docs/git-workflow.md`, inspect the PR and establish ownership before checkout; isolate shared/dirty trees. Fetch main, then `git merge origin/main --no-commit --no-ff`. Report non-conflict setup failures. The sandbox runner has already attempted the merge; do not repeat it.
2. Read applicable context and conflicted code. Resolve markers without unrelated edits. If intent is unclear, ask locally or report the unresolved issue in headless runs.
3. Run affected existing checks and inspect for remaining markers. Locally stage only this operation's resolved files; the sandbox runner stages its own work and preserves the merge state.
4. Report merged source, resolutions, verification and remaining issues. Stay on one PR, with no follow-up increments. Local commits/pushes require separate authorization; the sandbox runner publishes.

Unattended entry point: `pnpm agentic-pr-update --operation resolve-conflicts <pr>`.
