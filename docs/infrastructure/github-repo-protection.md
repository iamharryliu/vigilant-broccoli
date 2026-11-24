# GitHub Repository Protection

How `main` is protected, which actors bypass it, and the traps that follow from that.

## Table of Contents

- [Ruleset and bypass actors](#ruleset-and-bypass-actors)
- [Production deploys](#production-deploys)
- [Operational traps](#operational-traps)

## Ruleset and bypass actors

- `main` is protected by a Terraform-managed **repository ruleset** (`infrastructure/terraform/github.tf`), not classic branch protection. PRs are required and, via the `update` rule, only bypass actors can move `main` at all — so a direct push by a non-admin is rejected with `GH006`/`GH013`, and a PR can only be merged by an admin, never by the agent-sandbox/code-server GitHub App even though it holds Contents write.
- `main` requires the status checks `nx-affected`, `pre-commit` and `commitlint` (the job ids in `.github/workflows/ci-pr-check.yml`), with `strict_required_status_checks_policy = false` so a PR need not be up to date with `main`. Every job triggers on every PR to `main`; a job skipped by its `if` (`nx-affected` and `pre-commit` on the `edited` event, `commitlint` for Dependabot/Renovate authors) reports as skipped, which counts as passing, so none can stay pending forever. Adding or renaming a job in that workflow means updating the required contexts in `github.tf` too, or PRs will wait on a check that never reports.
- Repo admins (`RepositoryRole` 5) are the sole bypass actor of `main`'s ruleset, with `bypass_mode = "always"`: the GitHub mobile app has no bypass-merge option, so `pull_request` mode blocked every mobile merge on the `update` rule. The trade-off is that admins can merge past a red required check without an explicit prompt and can push directly to `main`. `GITHUB_TOKEN` has no bypass. The agent-sandbox/code-server GitHub App has Contents, Pull requests, and Workflows write permission but must use PRs; only an admin can merge them. GitHub's Contents permission authorizes both branch pushes and PR merges, so the ruleset prevents that App from moving `main`.

Upptime executes in `iamharryliu/uptime` using that repository's temporary `GITHUB_TOKEN`. The separate configuration-sync App is installed only on the monitoring repository and never bypasses protection here. A stolen App private key can mint fresh installation tokens until revoked; token expiry only bounds theft of an individual token.

## Production deploys

There is no `production` branch or ruleset. `deploy-release.yml` releases production after a verified staging deploy, or on a manual run (`pnpm gh:actions:release`, on `main`): it calls `deploy` with `environment: production` and the commit in the `production-deployed` tag, so only targets changed since the last release deploy (including the Docs MD, Agent Context and Grind 75 sites), then moves the tag to the released commit.

- `deploy-release` is not the only way to deploy production. Other entry points deploy the `production` environment from whatever ref is dispatched, with no ancestry check: `deploy` (`workflow_dispatch` input `environment: production`), `manual-deploy-app` (`environment: production`), and `ci-rotate-secrets`, which calls `deploy` for production on purpose. Whoever can dispatch workflows (admins; the agent-sandbox App has no `actions` write) can therefore deploy production from any ref. Vault's `github-actions-role` and the shared GCP `github` provider accept only `refs/heads/main`, so a dispatch from another branch fails to read secrets, but a dispatch from `main` succeeds.

## Operational traps

- Change protection by editing `github.tf` and running `pnpm tf:apply`, never in the GitHub UI (see [terraform.md](../ci/terraform.md)). A workflow that commits _conditionally_ can report success while blocked, so verify a bot commit actually lands rather than trusting a green run.
- `google-github-actions/auth` writes a `gha-creds-*.json` file into the job's working directory. It's gitignored, but any tool that does a blanket `git add .` (e.g. Upptime's commit step) will happily stage it if it isn't. Check `.gitignore` covers this before adding any workflow that both authenticates via WIF and auto-commits.
