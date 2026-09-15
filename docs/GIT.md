# GIT

- Never commit or push unless explicitly instructed to.

## Staying Current With `main`

Branches here are short-lived and PRs land as **squash merges**, so the cheapest way to avoid conflicts is to close the gap with `main` early and often rather than at review time.

- **Sync at the three natural checkpoints**: when starting work (branch from a freshly fetched `main`, never a stale local one), before pushing, and any time `main` moves while a branch is open. `/sync-main` does this; `/ship-pr` calls it at branch creation and again before the push.
- **Merge, don't rebase.** A rebase of an already-pushed branch can only be published with a force-push, which is forbidden here. `git merge --no-edit origin/main` is the supported move — the squash merge at PR time means these merge commits never reach `main`'s history, so there is no history-tidiness cost.
- **Check drift with `git rev-list --left-right --count origin/main...HEAD`** — left is what the branch is missing, right is what it adds. A left number in the dozens on a branch open more than a day is the signal to sync now.
- **`git pull --ff-only` on `main`.** If it refuses, `main` has local commits that never went through a PR — that is a state to report, not to paper over with a merge. `pull.rebase=false` is already set locally.
- **Enable `git rerere`** (`git config rerere.enabled true`): git records how a conflict was resolved and replays that resolution automatically the next time the same conflict appears. It pays for itself when a long-lived branch re-merges `main` repeatedly.

## Git Management

- `main` is protected by a Terraform-managed **repository ruleset** (`infrastructure/terraform/github.tf`), not classic branch protection. PRs are required; a direct push is rejected with `GH006`/`GH013`.
- Two bypass actors: repo admins (`RepositoryRole` 5, matching the old `enforce_admins = false`) and a dedicated GitHub App used only by the upptime crons (`Integration`, App ID in `var.upptime_gh_app_id`). `GITHUB_TOKEN` (the ambient per-job bot token) has no bypass — a bot identity can't hold a collaborator role, and the built-in "GitHub Actions" integration can't be a bypass actor on a user-owned repo (no owner organization). A GitHub App you create and install directly on the repo doesn't have that restriction. The agent sandbox's GitHub App is deliberately **not** a bypass actor — it goes through PRs, unlike the upptime app.
- The upptime app is scoped to Contents + Issues RW only — nothing else. Workflows mint a short-lived (~1h) installation token per run via `infrastructure/agent-sandbox/mint-github-app-token.sh`. The App ID is public (hardcoded in `variables.tf` and the two `cron-upptime*.yml` workflows, like the other non-secret IDs); only the private key (`UPPTIME_GH_APP_PRIVATE_KEY`) lives in Vault. Never reuse the broader Terraform/agent-sandbox GitHub credentials for a push-to-main use case — a long-lived, broadly-scoped token sitting in a job for a third-party action to read is a real credential-exposure surface; a purpose-built, narrowly-scoped, auto-expiring one bounds the blast radius if it ever leaks.
- Change protection by editing `github.tf` and running `pnpm tf:apply`, never in the GitHub UI (see [CI.md](./CI.md)). A workflow that commits _conditionally_ can report success while blocked, so verify a bot commit actually lands rather than trusting a green run.
- `google-github-actions/auth` writes a `gha-creds-*.json` file into the job's working directory. It's gitignored, but any tool that does a blanket `git add .` (e.g. Upptime's commit step) will happily stage it if it isn't. Check `.gitignore` covers this before adding any workflow that both authenticates via WIF and auto-commits.
