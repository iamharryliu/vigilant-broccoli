# CI

## GitHub Actions

- Always use Node.js 24-compatible action versions to avoid deprecation warnings (GitHub is deprecating the Node 20 runtime — a Node 20 action still runs but logs a warning on every job). Before pinning or bumping any action, verify its `action.yml` declares `runs.using: 'node24'` at the target SHA (`gh api "repos/OWNER/REPO/contents/action.yml?ref=SHA" --jq '.content' | base64 -d | grep using`); pin to the full commit SHA with a trailing `# vN` version comment. When adding an action already used elsewhere, copy its SHA from an existing workflow — the workflows are the source of truth for current pins. When bumping an action that appears in more than one workflow (or in `.github/actions/*`), bump every occurrence together so pins stay uniform.
- The README status badges must reflect the workflows in `.github/workflows/` — update them when a workflow is added, renamed, or removed, and keep the badge list in alphabetical order by workflow name.
- Cron-triggered workflows (`cron-*.yml`) must also be dispatchable on demand — include `workflow_dispatch:` alongside their `schedule:` trigger.
- Never introduce a new GitHub Actions repo secret, and remove unused ones. The only required repo secrets are `GCP_SERVICE_ACCOUNT` and `GCP_WORKLOAD_IDENTITY_PROVIDER` (used for Workload Identity Federation to GCP). Any other credential a workflow needs must come from GCP Secret Manager via `google-github-actions/get-secretmanager-secrets`, not a new repo secret — workflows may optionally read a repo secret as a fallback (e.g. `secrets.GH_PAT || secrets.GITHUB_TOKEN`) as long as the workflow still functions correctly when that secret is unset. The secret inventory lives in [secret-management.md](./infrastructure/secret-management.md).

## Upptime

- Every deployed service — apps and self-hosted infrastructure alike (e.g. Gitea, code-server) — must have an Upptime status check: add its public URL to `sites` in the root `.upptimerc.yml`. Services without a public URL (e.g. `vb-manager-next` served locally via PM2, RabbitMQ reachable only inside the VM network) are exempt and covered by `ci-health-check` instead.

## Terraform

- Infrastructure-as-code lives in `infrastructure/terraform/`, driven by the `pnpm tf:*` scripts — resource inventory and operations in [repo-operations.md](./repo-operations.md). Never change Terraform-managed provider config in a provider dashboard — the next apply reverts it.
