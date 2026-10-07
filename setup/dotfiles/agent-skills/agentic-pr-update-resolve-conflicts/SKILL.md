---
name: agentic-pr-update-resolve-conflicts
description: In vigilant-broccoli, merge origin/main into a PR branch and resolve conflicts while preserving both sides.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Merge `origin/main` into the specified PR branch and resolve conflicts while preserving the intent of both sides. Accept a PR number or URL.

1. In a local session, read `docs/git-workflow.md`, inspect the PR and establish ownership before checking out its branch. Use a clean isolated checkout if the current tree is shared or dirty. Fetch `origin/main` and merge it with `git merge origin/main --no-commit --no-ff`. Distinguish merge conflicts from other merge failures; stop and report a setup failure rather than treating it as a conflict. In a sandbox, the runner has already checked out the PR and attempted this merge; use that prepared state without repeating Git operations.
2. Read applicable `CONTEXT.md` guidance and each conflicted file's surrounding code. Resolve all conflict markers, preserve intended behavior from both branches, and make no unrelated changes. Ask for user judgment in a local session when the intended behavior cannot be determined; in headless runs report the unresolved issue instead of inventing a resolution.
3. Verify the affected behavior with appropriate existing checks and inspect the result for remaining conflict markers. In a local session, stage only the resolved files owned by this operation so Git can record their resolution; the sandbox runner stages its own work.
4. Report the merged source, resolved files, verification and remaining issues. Do not commit or push from the local skill unless separately authorized. In a sandbox, the runner preserves the merge state and performs the commit, push and PR update.

For the unattended sandbox version, run `pnpm agentic-pr-update-resolve-conflicts <pr>`.
