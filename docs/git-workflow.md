# Git Workflow

Branching, publishing and synchronization conventions for this repository.

## Table of Contents

- [Conventions](#conventions)
- [Commit message enforcement](#commit-message-enforcement)
- [Concurrent Agent Sessions](#concurrent-agent-sessions)
- [Staying Current With `main`](#staying-current-with-main)
- [Stacked Pull Requests](#stacked-pull-requests)

## Conventions

`ship-pr` and `sync-main` implement these rules; update this source first. Standing authorization and safety rules remain in [root context](../CONTEXT.md#git).

- **Branches:** `<committype>/<short-kebab-case-description>`, from freshly fetched `origin/main` unless continuing the task's existing branch.
- **Types:** `feat`, `fix`, `ci`, `chore`, `docs`, `refactor`, `enhancement`, `security`, `infrastructure`. Add a type only if none fits.
- **Commits and PR titles:** `<type>(<scope>): <Capitalized message>.` Scope is the affected app/service/lib, omitted for unscoped changes. Explain why concisely; end with a period. Commits use the authoring environment's `Co-Authored-By` trailer, never a hardcoded model name.
- **PR body:** keep `## Summary` bullets and `## Next steps` checkboxes current for the full PR. Next steps are remaining manual commands, UI checks, CI and merge; if only merging remains, say so. For UI checks, name apps/routes/components, affected shared consumers and expected behavior. Check off only completed work and record blockers. Use the environment's attribution when provided. Update an existing branch PR instead of opening another.
- **Concerns, suggestions and history:** all publishing flows use `infrastructure/agent-sandbox/merge-pr-body.py` for optional `## Concerns` (risks, limitations, unverified behavior, open questions the reviewer must weigh), `## Suggestions` (optional follow-up work only) and appended `## Agentic Change History` rows (`Date | Source | Command | Prompt | Summary`). Sources are `Local agent (Claude Code)`, `Local agent (Codex)`, `GitHub Actions` or `Docker sandbox (local)`.
- **Publishing parity:** changes to body sections, `pr_title`/`pr_summary`/`pr_next_steps`/`pr_concerns`/`pr_suggestions`, fallbacks or history fields must be mirrored across `ship-pr`, sandbox runners, `pr-increments.sh`, `commit-subject.sh` and `merge-pr-body.py`. Search consumers before changing the contract; follow [entry-point parity](./agent-support.md#entry-point-parity).

## Commit message enforcement

[commitlint.config.mjs](../commitlint.config.mjs) requires the types above, optional lower-case scope and capitalized subject ending in a period. Merge commits are ignored; header/body/footer lengths and attribution footers are unconstrained.

Enforcement is CI-only: `ci-pr-check` checks PR titles and commits; there is no local `commit-msg` hook. See [workflow checks](./ci/workflow-conventions.md#commit-message-checks) and the [quality-tool inventory](./code-quality-tools.md). Check a message locally with `printf '%s\n' 'feat(hearth): Add a page.' | npx commitlint`.

## Concurrent Agent Sessions

Sessions attached to one checkout share `HEAD`, the index and stash.

- Establish ownership before branching, staging, committing, stashing or switching. A subagent list does not enumerate independent sessions; an empty `ListAgents` result never proves exclusive use and is at most a best-effort hint.
- Default to a separate worktree: unless the checkout is provably exclusive to this session, create one off freshly fetched `origin/main` and apply only this session's changes there. Do not hold for peer acknowledgement.
- In an exclusively owned checkout, commit by pathspec, never stash and restore the original branch. If peer work is staged, use `git commit -m "<message>" -- <your paths>`; it commits the named working-tree files and leaves other index entries alone.
- Never stash shared/uncertain work. `sync-main` requires a clean, exclusive checkout in that case and does not authorize committing pending work to clean it.
- Restore a branch only if your workflow switched it in an exclusive checkout; do not switch a peer's branch during cleanup.

## Staying Current With `main`

Sync when starting work, before pushing and when main moves while a branch is open. `ship-pr` uses `sync-main` before publishing.

- Fetch first; `git rev-list --left-right --count origin/main...HEAD` reports missing/additional commits.
- On a feature branch, merge with `git merge --no-edit origin/main`. Never rebase: publishing a rewritten branch would require a forbidden force-push. PRs squash-merge, so these integration commits do not enter main's history.
- On main, use `git pull --ff-only origin main`; report divergence instead of merging over it.
- Enable `git rerere` (`git config rerere.enabled true`) to reuse conflict resolutions.

## Stacked Pull Requests

Follow the [increment contract](./agent-support.md#increment-contract). Independent PRs target main; dependent PRs target their prerequisite and carry a `## Stack` merge order.

Squash merges do not preserve commit identity: retargeting a dependent PR to main alone can show the prerequisite's changes again. Advance each dependent in order:

1. After its prerequisite merges, merge `origin/main` into the dependent branch and push normally. Preserve the dependent's changes while incorporating the prerequisite's final content.
2. Confirm `git diff origin/main HEAD` contains only this increment, then retarget to main if necessary.
3. Keep the prerequisite's branch until the dependent is advanced, or retarget explicitly before deleting it. Repeat for the next PR.

Never rebase or force-push stack branches. A failed increment is saved as a draft and blocks unpublished dependents; finish it with `pnpm agentic-pr-update <pr> "finish the task"` before merging subsequent work.
