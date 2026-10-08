# Git Workflow

Branching, staging, commit and PR conventions for this repository, and how to stay current with `main`.

## Table of Contents

- [Conventions](#conventions)
- [Concurrent Agent Sessions](#concurrent-agent-sessions)
- [Staying Current With `main`](#staying-current-with-main)

## Conventions

`/ship-pr` and `/sync-main` implement these; change the rule here first, then the skill. The standing prohibitions — no unprompted commits, no `git add -A`, no force-push, no skipped hooks, no amended commits, and the shared-worktree safety rules — stay in [CONTEXT.md](../CONTEXT.md#git), because they bind every session rather than only these workflows.

- **Branch names**: `<committype>/<short-kebab-case-description>` (e.g. `fix/rabbitmq-secret-rotation`, `feat/hearth-food-planner-page`), cut from a freshly fetched `main`.
- **Commit types**: `feat`, `fix`, `ci`, `chore`, `docs`, `refactor`, `enhancement`, `security`, `infrastructure` — match existing usage in `git log`; don't invent a new type unless nothing fits.
- **Commit messages**: `<committype>(<scope>): <Message>.` — scope is the affected app/service/lib (e.g. `hearth`, `github-actions`, `vb-manager-local-react`) and is omitted when the change isn't scoped to one; the message is capitalized, concise, focused on why not what, and ends with a period. Agent-authored commits end with the `Co-Authored-By:` trailer the environment specifies for the authoring model — never a hardcoded model name.
- **PR body**: a `## Summary` section (bullets) and a `## Next steps` section (checklist) of what's left for the human — manual commands to run (e.g. `pnpm tf:apply`), UI/manual spot checks, watching CI to green, and merging. When nothing else is left but merging, say so directly (e.g. `- [ ] Merge once CI is green`) rather than restating tests already run. For UI changes, name the affected apps, routes/pages, and shared components to spot-check, and expected behavior; include affected consumers when changing a shared component. Leave a step unchecked until it's actually been done, and record any blockers found along the way. Use the authoring environment’s attribution when provided; do not label Codex work as Claude Code. If the branch already has an open PR, push to it rather than opening a second.
- **Agentic change history**: every flow that opens or edits a PR on this branch's behalf — `ship-pr` and the `infrastructure/agent-sandbox/*-runner.sh` scripts behind the `pnpm agentic-pr-*` scripts — keeps `## Summary`/`## Next steps` current as the PR's cumulative state (not just the latest increment) and appends a row to a trailing `## Agentic Change History` table (`Date | Source | Command | Prompt | Summary`) recording what ran. `Source` is one of `Local agent (Claude Code)` / `Local agent (Codex)` (an interactive session, e.g. `ship-pr`), `GitHub Actions` (`$GITHUB_ACTIONS` set), or `Docker sandbox (local)` (the sandbox container run from a developer's machine). The shared `infrastructure/agent-sandbox/merge-pr-body.py` helper builds this merge — reuse it rather than hand-assembling the body.
- **Agentic flow parity**: the PR-body contract above (`## Summary` / `## Next steps` / `## Suggestions`, the `pr_title`/`pr_summary`/`pr_next_steps`/`pr_suggestions` meta fields, their fallback text, and the `HISTORY_*` row) is implemented independently by every flow below — none of them discover each other at runtime, so a change to a section name, a field, or its fallback wording made in one is invisible to the rest until mirrored by hand in the same change:
  - `setup/dotfiles/agent-skills/ship-pr/SKILL.md` (the interactive `/ship-pr` command)
  - `infrastructure/agent-sandbox/solve-todo-runner.sh`, `update-pr-runner.sh`, `create-todo-runner.sh`, `create-rnd-runner.sh`, `audit-todo-runner.sh`, `prune-runner.sh` (the `pnpm agentic-pr-*` sandbox runners)
  - `infrastructure/agent-sandbox/merge-pr-body.py`, the shared helper every flow above calls to actually write the sections — section names only match if this file's string literals match theirs

  Before relying on a flow having some behavior, check it has that behavior rather than assuming parity with another flow — `ship-pr` went without the `## Suggestions` section and without ever passing `--title` to `gh pr create` for a stretch because neither were ported over when the sandbox runners gained them. When changing the convention, `grep -rn` the old string across every file above and update all of them together, then update this bullet if the set of participating files changes.

- **Shared worktree**: more than one agent session can be attached to this checkout — check for peers before touching shared git state. See [Concurrent Agent Sessions](#concurrent-agent-sessions).

## Concurrent Agent Sessions

Claude Code and Codex sessions can share a working tree. The index, `HEAD`, and stash are shared by every session attached to it.

- **Establish ownership before touching shared Git state.** Use the environment's session tools when available, but a list of this conversation's subagents does not enumerate independent sessions or other agent applications. An empty list is not proof of exclusive use.
- **Coordinate with known peers.** Before branching, staging, committing, stashing, or switching branches, tell known peers which paths and Git operations you own and wait for their acknowledgement. Use available communication tools only as authorized by the task. If ownership cannot be established, use a separate worktree and carry over only this session's changes.
- **The index is shared, so commit by pathspec when others have staged work.** Use `git commit -m "<message>" -- <your paths>` so another session's staged files cannot ride along. This reads the named files from the working tree and leaves other index entries untouched.
- **Never stash in a shared or uncertain checkout.** A stash can take other sessions' uncommitted work. The `sync-main` skill requires a clean, exclusive checkout in that case; it does not authorize committing pending work just to make the tree clean.
- **A branch switch affects every session in the checkout.** Prefer a separate worktree for parallel work. Restore the original branch only when this workflow switched it in an exclusively owned checkout; do not switch a peer's active branch as cleanup.

## Staying Current With `main`

Branches here are short-lived and PRs land as **squash merges**, so the cheapest way to avoid conflicts is to close the gap with `main` early and often rather than at review time.

- **Sync at the three natural checkpoints**: when starting work (branch from a freshly fetched `main`, never a stale local one), before pushing, and any time `main` moves while a branch is open. `/sync-main` does this; `/ship-pr` calls it at branch creation and again before the push.
- **Merge, don't rebase.** A rebase of an already-pushed branch can only be published with a force-push, which is forbidden here. `git merge --no-edit origin/main` is the supported move — the squash merge at PR time means these merge commits never reach `main`'s history, so there is no history-tidiness cost.
- **Check drift with `git rev-list --left-right --count origin/main...HEAD`** — left is what the branch is missing, right is what it adds. A left number in the dozens on a branch open more than a day is the signal to sync now.
- **`git pull --ff-only` on `main`.** If it refuses, `main` has local commits that never went through a PR — that is a state to report, not to paper over with a merge. `pull.rebase=false` is already set locally.
- **Enable `git rerere`** (`git config rerere.enabled true`): git records how a conflict was resolved and replays that resolution automatically the next time the same conflict appears. It pays for itself when a long-lived branch re-merges `main` repeatedly.
