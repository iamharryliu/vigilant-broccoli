# Git Workflow

Branching, publishing and synchronization conventions for this repository.

## Table of Contents

- [Conventions](#conventions)
- [Commit message enforcement](#commit-message-enforcement)
- [Concurrent Agent Sessions](#concurrent-agent-sessions)
- [Staying Current With `main`](#staying-current-with-main)
- [Stacked Pull Requests](#stacked-pull-requests)

## Conventions

`ship-pr` implements these rules; update this source first. Standing authorization and safety rules remain in [root context](../CONTEXT.md#git).

- **Branches:** `<committype>/<short-kebab-case-description>`, from freshly fetched `origin/main` unless continuing the task's existing branch.
- **Types:** `feat`, `fix`, `ci`, `chore`, `docs`, `refactor`, `enhancement`, `security`, `infrastructure`. Add a type only if none fits, in both `commitlint.config.mjs` and `COMMIT_TYPES` in `infrastructure/agent-sandbox/commit-subject.sh`.
- **Commits and PR titles:** `<type>(<scope>): <Capitalized message>.` Scope is the affected app/service/lib, omitted for unscoped changes. Explain why concisely; end with a period. Commits use the authoring environment's `Co-Authored-By` trailer, never a hardcoded model name.
- **PR body:** keep `## Summary` bullets and `## Next steps` checkboxes current for the full PR. Next steps are remaining manual commands, UI checks, CI and merge; if only merging remains, say so. For UI checks, name apps/routes/components, affected shared consumers and expected behavior. Check off only completed work and record blockers. Use the environment's attribution when provided. Update an existing branch PR instead of opening another.
- **Screenshots:** Screenshots are required only when the changed page or component is reachable and renderable without authentication. If authentication or unavailable dependencies (a missing backend or secrets, or port conflicts) prevent exercising it in a browser, do not attempt or retry screenshots and do not mention missing screenshots as a PR concern or in `PR_CONCERNS`. Follow the [UI task contract](./agent-support.md#task-contract). `pr-screenshots.py --prepare` copies selected captures into tracked assets before the normal commit; its rendering mode verifies the committed bytes and supplies `PR_SCREENSHOTS` to `merge-pr-body.py`. A nonempty value replaces `## Screenshots`; unset preserves the existing section, and an explicitly empty value removes it. The helper moves and wraps even preserved legacy sections: `## Screenshots` contains a collapsible `<details><summary>Screenshots</summary>` block with blank lines around the images. Screenshots appear after all other content sections, including Concerns and Suggestions, immediately before `## Agentic Change History`, which stays last with the footer after it.
- **Concerns, suggestions and history:** all publishing flows use `infrastructure/agent-sandbox/merge-pr-body.py` for optional `## Concerns` (risks, limitations, unverified behavior, open questions the reviewer must weigh), `## Suggestions` (optional follow-up work only) and appended `## Agentic Change History` rows (`Date | Source | Command | Prompt | Summary`). Sources are `Local agent (Claude Code)`, `Local agent (Codex)`, `GitHub Actions` or `Docker sandbox (local)`.
- **Publishing parity:** changes to body sections, `pr_title`/`pr_summary`/`pr_next_steps`/`pr_concerns`/`pr_suggestions`/`pr_screenshots`, fallbacks or history fields must be mirrored across `ship-pr`, sandbox runners, `pr-increments.sh`, `commit-subject.sh` and `merge-pr-body.py`. Search consumers before changing the contract; follow [entry-point parity](./agent-support.md#entry-point-parity).

## Commit message enforcement

[commitlint.config.mjs](../commitlint.config.mjs) requires the types above, optional lower-case scope and capitalized subject ending in a period. Merge commits and GitHub Copilot Autofix commits (`Potential fix for pull request finding …`) are ignored; header/body/footer lengths and attribution footers are unconstrained.

Enforcement is CI-only: `ci-pr-check` checks PR titles and commits; there is no local `commit-msg` hook. See [workflow checks](./ci/workflow-conventions.md#commit-message-checks) and the [quality-tool inventory](./code-quality-tools.md). Check a message locally with `printf '%s\n' 'feat(hearth): Add a page.' | npx commitlint`.

## Concurrent Agent Sessions

Sessions attached to one checkout share `HEAD`, the index and stash. Ownership, worktree, stash and staged-peer-work rules are in [root context](../CONTEXT.md#git); additionally:

- A subagent list does not enumerate independent sessions; an empty `ListAgents` result never proves exclusive use and is at most a best-effort hint. Create the worktree without holding for peer acknowledgement.
- In an exclusively owned checkout, commit by pathspec, never stash and restore the original branch. `git commit -m "<message>" -- <your paths>` commits the named working-tree files and leaves other index entries alone.
- Syncing in place requires a clean, exclusive checkout and does not authorize committing pending work to clean it.
- Restore a branch only if your workflow switched it in an exclusive checkout; do not switch a peer's branch during cleanup.

## Staying Current With `main`

Sync when starting work, before pushing and when main moves while a branch is open. `ship-pr` syncs before publishing.

- Fetch first; `git rev-list --left-right --count origin/main...HEAD` reports missing/additional commits.
- On a feature branch, merge with `git merge --no-edit origin/main`. A branch whose Markdown tables are still padded (cut before [table compaction](./code-quality-tools.md)) merges with `git merge --no-edit -X renormalize origin/main`, which compacts both sides before comparing them. Never rebase: publishing a rewritten branch would require a forbidden force-push. PRs squash-merge, so these integration commits do not enter main's history.
- On main, use `git pull --ff-only origin main`; report divergence instead of merging over it.
- Enable `git rerere` (`git config rerere.enabled true`) to reuse conflict resolutions.

## Stacked Pull Requests

Follow the [increment contract](./agent-support.md#increment-contract). Independent PRs target main; dependent PRs target their prerequisite and carry a `## Stack` merge order.

Squash merges do not preserve commit identity: retargeting a dependent PR to main alone can show the prerequisite's changes again. Advance each dependent in order:

1. After its prerequisite merges, merge `origin/main` into the dependent branch and push normally. Preserve the dependent's changes while incorporating the prerequisite's final content.
2. Confirm `git diff origin/main HEAD` contains only this increment, then retarget to main if necessary.
3. Keep the prerequisite's branch until the dependent is advanced, or retarget explicitly before deleting it. Repeat for the next PR.

Never rebase or force-push stack branches. A failed increment is saved as a draft and blocks unpublished dependents; finish it with `pnpm agentic-pr-update <pr> "finish the task"` before merging subsequent work.
