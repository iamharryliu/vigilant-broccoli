---
name: agentic-pr-update-fix-ci
description: In vigilant-broccoli, diagnose a PR's failing CI checks from their logs and fix the branch so the checks pass.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Fix the specified PR's failing CI so its checks pass, preserving the work already on its branch. Accept a PR number or URL, optionally followed by extra guidance (which failures to focus on, constraints) that narrows the fix without replacing it.

1. In a local session, read `docs/git-workflow.md`, inspect the PR and establish ownership before checking out its branch. Use an isolated checkout if the current tree is shared or dirty. Collect the failures with `gh pr checks <pr>` and `gh run view <run-id> --log-failed` for the branch's failed runs. In a sandbox, the runner has already checked out the PR and supplied the checks summary and failed-step logs in the prompt; use them without repeating setup or calling `gh`.
2. Diagnose each failure from the logs before editing. Read the failing code and applicable `CONTEXT.md` guidance, then make the minimal changes that fix the root cause, following repo conventions. Do not skip, disable or weaken checks to make them pass, and do not expand into unrelated cleanup.
3. Formatting-only failures from the pre-commit job (trailing-whitespace, end-of-file-fixer, black) are fixed by running pre-commit; the sandbox runner does this itself, so spend effort on real lint, test, build or logic failures. If a failure is unrelated to the branch (flaky test, outage, missing credential), say so instead of inventing a code change.
4. Re-run the affected checks locally where possible and report each failure, its cause, the fix and the verification result. Describe the PR's cumulative result, not only this increment.
5. This operation always stays on the one PR: it never splits into increments or opens follow-up PRs. Report unrelated findings instead. Leave local changes uncommitted unless publishing was separately authorized. Sandbox runners own staging, committing, pushing and updating PR metadata.

For the unattended sandbox version, run `pnpm agentic-pr-update-fix-ci <pr> ["<instruction>"]`.
