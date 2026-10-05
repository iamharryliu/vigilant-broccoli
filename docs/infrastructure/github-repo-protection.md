# GitHub Repository Protection

How `main` is protected, which actors bypass it, and the traps that follow from that.

## Ruleset and bypass actors

- `main` is protected by a Terraform-managed **repository ruleset** (`infrastructure/terraform/github.tf`), not classic branch protection. PRs are required and, via the `update` rule, only bypass actors can move `main` at all — so a direct push is rejected with `GH006`/`GH013`, and a PR can only be merged by an admin, never by the agent-sandbox/code-server GitHub App even though it holds Contents write.
- Repo admins (`RepositoryRole` 5) are the sole bypass actor. `GITHUB_TOKEN` has no bypass. The agent-sandbox/code-server GitHub App has Contents, Pull requests, and Workflows write permission but must use PRs; only an admin can merge them. GitHub's Contents permission authorizes both branch pushes and PR merges, so the ruleset prevents that App from moving `main`.

Upptime executes in `iamharryliu/uptime` using that repository's temporary `GITHUB_TOKEN`. The separate configuration-sync App is installed only on the monitoring repository and never bypasses protection here. The legacy Upptime App's bypass and workflows are retired; [retirement steps](./upptime.md#legacy-retirement) cover uninstalling it and removing its stored key after a successful scheduled check. A stolen App private key can mint fresh installation tokens until revoked; token expiry only bounds theft of an individual token.

## Operational traps

- Change protection by editing `github.tf` and running `pnpm tf:apply`, never in the GitHub UI (see [terraform.md](../ci/terraform.md)). A workflow that commits _conditionally_ can report success while blocked, so verify a bot commit actually lands rather than trusting a green run.
- `google-github-actions/auth` writes a `gha-creds-*.json` file into the job's working directory. It's gitignored, but any tool that does a blanket `git add .` (e.g. Upptime's commit step) will happily stage it if it isn't. Check `.gitignore` covers this before adding any workflow that both authenticates via WIF and auto-commits.
