---
name: agentic-pr-update-fix-ci
description: In vigilant-broccoli, diagnose a PR's failing CI checks from their logs and fix the branch so the checks pass.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Fix a PR number/URL's failing checks. Optional guidance may narrow the failures or constraints.

1. Locally, follow `docs/git-workflow.md` and establish ownership before checkout; isolate shared/dirty trees. Collect failures with `gh pr checks <pr>` and `gh run view <run-id> --log-failed`. Sandbox runners supply the checkout and logs; do not repeat setup or call `gh`.
2. Diagnose from logs and applicable context. Fix causes without weakening checks or unrelated cleanup. Run pre-commit for formatting failures locally; the sandbox runner handles them. Report flakes, outages or missing credentials instead of inventing code changes; with no file change needed, give the reason per [no-change decisions](../../../../docs/agent-support.md#task-contract). A commitlint failure on the PR title needs no file change: locally run `gh pr edit --title`; sandbox runners apply the `pr_title` metadata field.
3. Re-run affected checks where possible. Report each cause, fix and verification, plus the PR's cumulative result.

Stay on this PR; no increments or follow-up PRs. Local invocation does not authorize publishing; sandbox runners own commits, pushes and PR metadata.

Unattended entry point: `pnpm agentic-pr-update --operation fix-ci <pr> ["<instruction>"]`.
