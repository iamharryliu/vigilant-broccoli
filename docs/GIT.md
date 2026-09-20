# GIT

- Never commit or push unless explicitly instructed to.

## Conventions

`/ship-pr` and `/sync-main` implement these; change the rule here first, then the command.

- **Staging**: stage only the files created or edited in the current session — never `git add -A` or `git add .`, and never files that were already modified or untracked before the session began, even if they look related.
- **Branch names**: `<committype>/<short-kebab-case-description>` (e.g. `fix/rabbitmq-secret-rotation`, `feat/hearth-food-planner-page`), cut from a freshly fetched `main`.
- **Commit types**: `feat`, `fix`, `ci`, `chore`, `docs`, `refactor`, `enhancement`, `security`, `infrastructure` — match existing usage in `git log`; don't invent a new type unless nothing fits.
- **Commit messages**: `<committype>(<scope>): <Message>.` — scope is the affected app/service/lib (e.g. `hearth`, `github-actions`, `vb-manager-next`) and is omitted when the change isn't scoped to one; the message is capitalized, concise, focused on why not what, and ends with a period. Agent-authored commits end with the `Co-Authored-By:` trailer the environment specifies for the authoring model — never a hardcoded model name.
- **PR body**: a `## Summary` section (bullets) and a `## Test plan` section (checklist), ending with the Claude Code footer. If the branch already has an open PR, push to it rather than opening a second.
- **Safety**: never force-push, never skip hooks, never amend existing commits.
- **Shared worktree**: more than one Claude session can be attached to this checkout — check for peers before touching shared git state. See [Concurrent Claude Sessions](#concurrent-claude-sessions).

## Concurrent Claude Sessions

Several Claude Code sessions can be attached to this one working tree at the same time (separate tmux panes on the same checkout). The index, `HEAD`, and the stash are **shared** between them, so a routine `/ship-pr` can sweep up — or throw away — another session's in-flight work.

- **Check before touching shared git state.** Run `ListAgents` before branching, staging, committing, stashing, or switching branches. Peer sessions on this machine are listed by name, and that name is the address for `SendMessage`.
- **Announce, then get the ack.** Tell each peer what you are about to do and which paths you own, and ask it to hold git operations and file writes until you say otherwise. `notify_when_idle: true` subscribes you to a one-shot notice when it next goes quiet. Message it again once the push lands so it can resume.
- **The index is shared, so commit by pathspec.** A peer's `git add`/`git mv` is already staged in the same index, and a bare `git commit` takes it along. Use `git commit -m "<message>" -- <your paths>` — the pathspec after `--` commits those files from the working tree and leaves every other index entry untouched. This is the one case where not staging first is the correct move.
- **Never stash in a shared tree.** `git stash push -u` takes everyone's uncommitted work with it, and `/sync-main` step 3 does exactly that whenever the tree is dirty. On a shared checkout, commit your own paths first and sync a clean branch instead.
- **A branch switch is global.** `git checkout -b` moves `HEAD` for every session on the tree. Uncommitted changes carry across and survive, but return to the original branch when you are done (`/ship-pr` step 9) so peers find the tree where they left it.
- **Genuinely parallel work belongs in its own worktree.** `git worktree add` gives a session its own index and `HEAD`, and none of the above applies.

## Staying Current With `main`

Branches here are short-lived and PRs land as **squash merges**, so the cheapest way to avoid conflicts is to close the gap with `main` early and often rather than at review time.

- **Sync at the three natural checkpoints**: when starting work (branch from a freshly fetched `main`, never a stale local one), before pushing, and any time `main` moves while a branch is open. `/sync-main` does this; `/ship-pr` calls it at branch creation and again before the push.
- **Merge, don't rebase.** A rebase of an already-pushed branch can only be published with a force-push, which is forbidden here. `git merge --no-edit origin/main` is the supported move — the squash merge at PR time means these merge commits never reach `main`'s history, so there is no history-tidiness cost.
- **Check drift with `git rev-list --left-right --count origin/main...HEAD`** — left is what the branch is missing, right is what it adds. A left number in the dozens on a branch open more than a day is the signal to sync now.
- **`git pull --ff-only` on `main`.** If it refuses, `main` has local commits that never went through a PR — that is a state to report, not to paper over with a merge. `pull.rebase=false` is already set locally.
- **Enable `git rerere`** (`git config rerere.enabled true`): git records how a conflict was resolved and replays that resolution automatically the next time the same conflict appears. It pays for itself when a long-lived branch re-merges `main` repeatedly.

## Git Management

- `main` is protected by a Terraform-managed **repository ruleset** (`infrastructure/terraform/github.tf`), not classic branch protection. PRs are required and, via the `update` rule, only bypass actors can move `main` at all — so a direct push is rejected with `GH006`/`GH013`, and a PR can only be merged by an admin, never by the agent-sandbox/code-server GitHub App even though it holds Contents write.
- Two bypass actors: repo admins (`RepositoryRole` 5, matching the old `enforce_admins = false`) and a dedicated GitHub App used only by the upptime crons (`Integration`, App ID in `var.upptime_gh_app_id`). `GITHUB_TOKEN` (the ambient per-job bot token) has no bypass — a bot identity can't hold a collaborator role, and the built-in "GitHub Actions" integration can't be a bypass actor on a user-owned repo (no owner organization). A GitHub App you create and install directly on the repo doesn't have that restriction. The agent sandbox's GitHub App (Contents + Pull requests + Workflows RW; the code-server VM uses it too, via 1-hour tokens a workflow delivers) is deliberately **not** a bypass actor — it goes through PRs, unlike the upptime app. Note GitHub has no permission that allows pushing branches but not merging PRs (both need Contents write), so the ruleset is what keeps that app off `main`.
- The upptime app is scoped to Contents + Issues RW only — nothing else. Workflows mint a short-lived (~1h) installation token per run via `infrastructure/agent-sandbox/mint-github-app-token.sh`. The App ID is public (hardcoded in `variables.tf` and the two `cron-upptime*.yml` workflows, like the other non-secret IDs); only the private key (`UPPTIME_GH_APP_PRIVATE_KEY`) lives in Vault. Never reuse the broader Terraform/agent-sandbox GitHub credentials for a push-to-main use case — a long-lived, broadly-scoped token sitting in a job for a third-party action to read is a real credential-exposure surface; a purpose-built, narrowly-scoped, auto-expiring one bounds the blast radius if it ever leaks.
- Change protection by editing `github.tf` and running `pnpm tf:apply`, never in the GitHub UI (see [CI.md](./CI.md)). A workflow that commits _conditionally_ can report success while blocked, so verify a bot commit actually lands rather than trusting a green run.
- `google-github-actions/auth` writes a `gha-creds-*.json` file into the job's working directory. It's gitignored, but any tool that does a blanket `git add .` (e.g. Upptime's commit step) will happily stage it if it isn't. Check `.gitignore` covers this before adding any workflow that both authenticates via WIF and auto-commits.
