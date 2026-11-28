# Git Workflow

Branching, publishing and synchronization conventions for this repository.

## Table of Contents

- [Conventions](#conventions)
- [Commit message enforcement](#commit-message-enforcement)
- [Concurrent Agent Sessions](#concurrent-agent-sessions)
- [Fresh Worktree Prep](#fresh-worktree-prep)
- [Staying Current With `main`](#staying-current-with-main)

## Conventions

`ship-pr` implements these rules; update this source first. Standing authorization and safety rules remain in [root context](../CONTEXT.md#git).

- **Branches:** `<committype>/<short-kebab-case-description>`, from freshly fetched `origin/main` unless continuing the task's existing branch.
- **Types:** `feat`, `fix`, `ci`, `chore`, `docs`, `refactor`, `enhancement`, `security`, `infrastructure`. Add a type only if none fits, in both `commitlint.config.mjs` and `COMMIT_TYPES` in `infrastructure/agent-sandbox/commit-subject.sh`.
- **Commits and PR titles:** `<type>(<scope>): <Capitalized message>.` Scope is the affected app/service/lib, omitted for unscoped changes. Explain why concisely; end with a period. Commits use the authoring environment's `Co-Authored-By` trailer, never a hardcoded model name.
- **PR body:** keep `## Summary` and `## Next steps` current for the full PR. Summary is brief (about 80 words) with `### Why` (one or two bullets on the motivating problem) and `### Changes` (at most four bullets, key paths only). Next steps are remaining manual commands, UI checks, CI and merge; if only merging remains, say so. Left-out work is a brief written step followed by its TODO id when a row covers it (`- [ ] Migrate the remaining routes (TODO \`abc123\`)`), never a bare id. For UI checks, name apps/routes/components, affected shared consumers and expected behavior. Check off only completed work and record blockers. Use the environment's attribution when provided. Update an existing branch PR instead of opening another.
- **Screenshots:** eligibility, capture, wrapping and section placement follow the [UI task contract](./agent-support.md#task-contract). `pr-screenshots.py --prepare` copies selected captures into tracked assets before the normal commit; its rendering mode verifies the committed bytes and supplies `PR_SCREENSHOTS` to `merge-pr-body.py`. A nonempty value replaces `## Screenshots`; unset preserves the existing section, and an explicitly empty value removes it.
- **Concerns, suggestions and history:** all publishing flows use `infrastructure/agent-sandbox/merge-pr-body.py` for optional `## Concerns` (risks, limitations, unverified behavior, open questions the reviewer must weigh), `## Suggestions` (optional follow-up work only) and appended `## Agentic Change History` rows (`Date | Source | Command | Prompt | Summary`). Sources are `Local agent (Claude Code)`, `Local agent (Codex)`, `GitHub Actions` or `Docker sandbox (local)`.
- **Publishing parity:** changes to body sections, `pr_title`/`pr_summary`/`pr_next_steps`/`pr_concerns`/`pr_suggestions`/`pr_screenshots`, fallbacks or history fields must be mirrored across `ship-pr`, sandbox runners, `publish-pr.sh`, `commit-subject.sh` and `merge-pr-body.py`. Search consumers before changing the contract; follow [entry-point parity](./agent-support.md#entry-point-parity).

## Commit message enforcement

[commitlint.config.mjs](../commitlint.config.mjs) requires the types above, optional lower-case scope and capitalized subject ending in a period. Merge commits and GitHub Copilot Autofix commits (`Potential fix for pull request finding …`) are ignored; header/body/footer lengths and attribution footers are unconstrained.

Enforcement is CI-only: `ci-pr-check` checks PR titles and commits; there is no local `commit-msg` hook. See [workflow checks](./ci/workflow-conventions.md#commit-message-checks) and the [quality-tool inventory](./code-quality-tools.md). Check a message locally with `printf '%s\n' 'feat(hearth): Add a page.' | npx commitlint`.

## Concurrent Agent Sessions

Sessions attached to one checkout share `HEAD`, the index and stash. Ownership, worktree, stash and staged-peer-work rules are in [root context](../CONTEXT.md#git); additionally:

- A subagent list does not enumerate independent sessions; an empty `ListAgents` result never proves exclusive use and is at most a best-effort hint. Create the worktree without holding for peer acknowledgement.
- In an exclusively owned checkout, commit by pathspec and never stash; `git commit -m "<message>" -- <your paths>` commits the named working-tree files and leaves other index entries alone.
- Syncing in place requires a clean, exclusive checkout and does not authorize committing pending work to clean it.
- Restore the original branch only if your workflow switched it in an exclusive checkout; never switch a peer's branch during cleanup.

## Fresh Worktree Prep

A new worktree has no `node_modules` and none of the gitignored generated files, so the first pre-commit run fails (and installs dependencies as a side effect) unless you prepare first. Do this right after `git worktree add`, before the first commit:

- Run `pnpm install` from the worktree root; `projects/nx-workspace` has its own install, and the root `pnpm format:commit` hook runs both. Hooks otherwise install lazily and the first commit attempt fails with "Could not find Nx modules".
- Gitignored generated files (Hearth's `src/lib/generated/in-season-produce.json`, [why](../projects/nx-workspace/apps/hearth/docs/features/in-season-produce.md)) are produced by Nx `generate-*` targets that `typecheck`, `lint` and `build` depend on. A lint-staged hook must therefore run the Nx target (`pnpm nx run hearth:typecheck`), never a bare `tsc`; a `TS2307: Cannot find module './generated/…'` in a hook means a hook bypasses Nx, so fix the hook.
- Format with the worktree's own Prettier (run it from inside the worktree); the repo config is `.prettierrc.json`, and passing the YAML `.prettierrc` errors.
- After every `git commit`, check `git log -1` and `git status` before pushing or opening a PR. A failed hook leaves the changes staged with no commit, and piping hook output through `tail` hides that.
- Fetch and compare with `origin/main` immediately before pushing; slow hooks let main move, and a PR opened first needs an extra merge commit.

If a step here keeps failing for a reason not listed, fix or document it here and tell the user; if the fix is out of scope for the PR, offer a TODO row instead of working around it silently.

## Staying Current With `main`

Sync when starting work, before pushing and when main moves while a branch is open. `ship-pr` syncs before publishing.

- Fetch first; `git rev-list --left-right --count origin/main...HEAD` reports missing/additional commits.
- On a feature branch, merge with `git merge --no-edit origin/main`; add `--no-ff` when the dotfiles `pull.ff = only` is active, which makes a plain merge of a diverged branch abort with "Not possible to fast-forward". A branch whose Markdown tables are still padded (cut before [table compaction](./code-quality-tools.md)) merges with `git merge --no-edit -X renormalize origin/main`, which compacts both sides before comparing them. Never rebase: publishing a rewritten branch would require a forbidden force-push. PRs squash-merge, so these integration commits do not enter main's history.
- On main, use `git pull --ff-only origin main`; report divergence instead of merging over it.
- Enable `git rerere` (`git config rerere.enabled true`) to reuse conflict resolutions.
