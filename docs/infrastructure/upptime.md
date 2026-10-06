# Isolated Upptime Monitoring

Manage monitoring from vigilant-broccoli while running Upptime with credentials limited to a separate public repository.

## Table of Contents

- [Architecture](#architecture)
- [Managed files and runtime behavior](#managed-files-and-runtime-behavior)
- [Setup and migration](#setup-and-migration)
- [Operations](#operations)
- [Security limits](#security-limits)
- [Free Tier](#free-tier)

## Architecture

- `iamharryliu/vigilant-broccoli` owns `.upptimerc.yml` and `infrastructure/upptime/`.
- `iamharryliu/uptime` owns generated monitoring history and incident issues. Terraform creates this public repo; `upptime_repo` defaults to `uptime`.
- `ci-sync-upptime.yml`, reachable only on `main`, reads the dedicated sync App key from `kv/upptime-sync` through `github-actions-upptime-sync-role`. The GCP identity only reads the two Cloudflare Access secrets needed to reach Vault; its WIF binding is pinned to this workflow on `main`.
- The sync App is installed **only on the monitoring repo**, with Contents and Workflows read/write. It has no installation or ruleset bypass in vigilant-broccoli. Each sync mints a repository-restricted installation token with those two permissions.
- Monitoring workflows use the monitoring repo's temporary `GITHUB_TOKEN`, with Contents and Issues write and no OIDC permission. The monitoring repo receives no private key, Vault/GCP credentials, or application secrets.
- GitHub Pages serves the monitoring repo's `gh-pages` branch at `upptime.harryliu.dev` (Terraform `github_repository_pages.upptime`, DNS-only CNAME to `<owner>.github.io` in `cloudflare-harryliu-dev.tf`). `cron-upptime-site.yml` builds Upptime's static status site with `upptime/uptime-monitor`'s `site` command (daily at 01:40 UTC, manual, or `static_site` dispatch) and force-pushes the export to `gh-pages` using the temporary `GITHUB_TOKEN`; the `status-website` block in `.upptimerc.yml` sets the domain. The branch is created from `main` by Terraform, so the page is empty until the first workflow run. Apply locally with `pnpm tf:apply`, then enable HTTPS enforcement once the certificate is issued.
- The Pages Index status page reads the monitoring repo's public `history/summary.json` and shows workflow badges from both repos. Missing or failed monitoring data displays an error; archived source-repository data is never used as a fallback.

## Managed files and runtime behavior

The sync publishes an explicit allowlist through GitHub's Git database API:

- `.upptimerc.yml` — same endpoints and names; `owner` and `repo` are rendered from Terraform's `UPPTIME_REPOSITORY` variable.
- `.nvmrc` — Node version from the workspace root for the graph runtime.
- `.github/workflows/cron-upptime.yml` — hourly at minute 7, plus manual/dispatch triggers; updates uptime and then refreshes the summary.
- `.github/workflows/cron-upptime-response-time.yml` — daily at 00:25 UTC, plus manual/dispatch triggers; records response times, refreshes the summary, then generates and verifies README graphs and badge endpoints.
- `.github/workflows/cron-upptime-site.yml` — daily at 01:40 UTC, plus manual/dispatch triggers; builds the static status site from `history/` and publishes it to `gh-pages`.
- `scripts/warm-fly.sh` — parallel HTTP requests to staging and production VB Express, up to three 20-second attempts with three-second waits. HTTP errors fail warming; an exhausted warm-up emits a warning and Upptime still checks for a real outage.
- `scripts/graphs/package.json` and `package-lock.json` — isolated, locked graph dependencies with a Node 24-compatible canvas override.
- `README.md` — managed text around Upptime's generated status-table markers. Existing table content is preserved on sync.

Sync creates a commit on the current monitoring tip using its existing tree, never force-updates the branch, and retries if monitoring advances during publication. It neither checks out target files nor executes target code. Generated `history/` files and other unlisted files are left untouched. Keep the allowlist in `sync.py` explicit when adding or retiring a managed file.

The source config disables Upptime's description, topics, and homepage updates. Terraform owns repository settings; the monitoring token cannot perform these administrative writes. This avoids caught 403 errors during otherwise successful summary updates.

Both monitoring workflows share the `upptime` concurrency group, use full-history checkouts and pinned Node 24-compatible actions, and finish within 15 minutes. Terraform restricts allowed actions to those exact SHAs; update the allowlist when changing a pin. Summary generation is an explicit step, so it does not depend on `GITHUB_TOKEN` pushes triggering another workflow ([GitHub behavior](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)). Template/dependency regeneration workflows are not installed.

Upptime's summary command writes the README table and `history/summary.json`; it does not create the table's linked images or Shields endpoints. The daily workflow installs the locked graph runtime with `npm ci`, invokes its CLI directly, verifies every service's badge JSON and weekly PNG, and commits only `api/` and `graphs/`. Installation and generation failures stop the workflow before publication. The runtime pins `@upptime/graphs` and overrides its old canvas dependency with `canvas@3.2.0`, whose N-API implementation works on Node 24 ([canvas release](https://github.com/Automattic/node-canvas/releases/tag/v3.0.0)). The upstream action's `graphs` command runs floating `npx` dependencies and ignores subprocess exit codes. [Runtime nuance](../../infrastructure/upptime/graphs/CONTEXT.md#canvas-2-fails-on-node-24) records this constraint.

These assets supply the README's all-time, day, week, month, and year metrics ([badges](https://upptime.js.org/docs/badges/)). Run the response-time workflow manually after initializing a repository to populate them. Sync preserves generated assets. Before publishing this workflow change, apply the Terraform action allowlist update for the pinned `actions/setup-node` SHA.

## Setup and migration

1. For a new monitoring repository, set `upptime_migration_complete = false` to keep schedules disabled while initializing it. Run `pnpm tf:plan`, then apply reviewed changes locally with `pnpm tf:apply`. Terraform creates the public repository, action restrictions, dedicated sync identity, source variables, and Vault role through post-apply. An App ID of zero keeps configuration sync disabled.
2. Register a private GitHub App with Contents and Workflows read/write, webhooks inactive, installed only on the monitoring repository. Store its key using `pnpm upptime:sync:store-key /absolute/path/app-key.pem` and set its public ID as `upptime_sync_gh_app_id` in `variables.tf`. Apply that change locally. No new GitHub Actions secret is introduced.
3. If importing an existing monitoring archive, authenticate local GitHub/GCP tooling and fetch complete source history before exporting. The retained `history/` in vigilant-broccoli is an archive of the old implementation; ongoing history lives in `iamharryliu/uptime`.

   ```bash
   git fetch origin main
   pnpm upptime:history:export /private/tmp/upptime-history.bundle refs/remotes/origin/main
   pnpm upptime:history:import /private/tmp/upptime-history.bundle iamharryliu/uptime
   ```

   Fetch unshallow history first if needed. Import into an uninitialized monitoring dataset before running checks. The importer uses a temporary bare repo, preserves target files, refuses existing history, and pushes only a fast-forward merge. `iamharryliu/uptime` is already populated; do not re-import.

4. Run `pnpm gh:actions:sync-upptime`, then manually run both monitoring workflows. Verify refreshed history, `history/summary.json`, all services on Pages Index `/#/status`, and README graphs and badges. Subscribe to incident issues in the new repository when configuring notifications.
5. Set `upptime_migration_complete = true` and apply the reviewed plan to enable schedules. This flag now controls only the monitoring repository's schedule gate. Verify a successful scheduled uptime run; GitHub may delay cron jobs. Application credentials and observability infrastructure require no changes.

App creation and installation are account setup; Terraform manages repository configuration.

Keep sync App `5202397`, installed only on `uptime`. Refresh the Bitwarden backup after changing Vault fields using `projects/nx-workspace/scripts/shell/backup-secrets.sh`.

## Operations

- Edit endpoints in the root `.upptimerc.yml`; a push to `main` syncs config automatically. Edit runtime workflows under `infrastructure/upptime/workflows/`; `.github/workflows/ci-sync-upptime.yml` publishes them to the monitoring repository.
- `pnpm upptime:config:render /private/tmp/upptime-config` renders the allowlist into an empty external directory without credentials or network access.
- `pnpm gh:actions:sync-upptime` republishes configuration on demand. A no-change sync produces no commit.
- New endpoint names change Upptime's inferred slugs; preserve names or specify stable slugs when renaming to keep the existing history ([Upptime configuration](https://upptime.js.org/docs/configuration/)).
- Watch sync failures and monitoring run freshness. GitHub may delay/drop scheduled jobs or disable schedules after 60 days of inactivity ([GitHub schedules](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows)); history commits normally provide activity, but prolonged failures need attention. This design does not add an independent watchdog.
- Rotate the sync App key by generating a replacement, storing it with `upptime:sync:store-key`, verifying a sync, and revoking the previous key.
- Grafana, Loki, Alloy, and the observability VM health timer require no changes; `/health` remains a monitored endpoint.

## Security limits

A compromised monitoring action can falsify history, alter repository contents other than workflow files, manipulate incident issues, and send arbitrary outbound requests from its hosted runner. It cannot use the monitoring token to authorize writes to vigilant-broccoli or authenticate to Vault/GCP. Public endpoints remain reachable just as they are from any internet client.

The sync App's private key is still a sensitive management credential; it can modify monitoring workflows. Only trusted source code executes in its workflow, and the monitoring repository must never be added to the App's installation scope alongside vigilant-broccoli. SHA pinning reduces upstream replacement risk, but does not prove the pinned code is vulnerability-free ([GitHub action security](https://docs.github.com/en/actions/reference/security/secure-use)).

Warm-up intentionally measures warmed availability and response time; it does not capture user cold-start latency. Hourly polling can miss short outages, and successful login-page responses do not prove backend health. Those are existing coverage limitations, separate from credential isolation.

## Free Tier

- GitHub-hosted standard runners are free for public repositories ([GitHub billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)). Monitoring uses roughly 25 scheduled workflow runs per day; sync runs only on configuration changes or manual dispatch. The daily static-site build adds one more scheduled run; GitHub Pages is free for public repositories. Pages Index continues displaying the public summary.
- Graph and badge generation runs within the existing daily response-time workflow, adding dependency installation and rendering time without another scheduled run.
- The dedicated GCP service account and WIF provider add no VM. They reuse the existing Cloudflare Access secrets and Vault VM, adding only authentication/secret-read operations to the current services.
- No paid monitoring subscription or new persistent compute resource is required.
