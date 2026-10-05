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
- The Pages Index status page reads the monitoring repo's public `history/summary.json` and shows workflow badges from both repos. It falls back to the legacy summary only on HTTP 404 while the new repo is being initialized.

## Managed files and runtime behavior

The sync publishes an explicit allowlist through GitHub's Git database API:

- `.upptimerc.yml` — same endpoints and names; `owner` and `repo` are rendered from Terraform's `UPPTIME_REPOSITORY` variable. The root source retains its legacy repository identity until legacy checks are retired.
- `.github/workflows/cron-upptime.yml` — hourly at minute 7, plus manual/dispatch triggers; updates uptime and then refreshes the summary.
- `.github/workflows/cron-upptime-response-time.yml` — daily at 00:25 UTC, plus manual/dispatch triggers; records response times and refreshes the summary.
- `scripts/warm-fly.sh` — parallel HTTP requests to staging and production VB Express, up to three 20-second attempts with three-second waits. HTTP errors fail warming; an exhausted warm-up emits a warning and Upptime still checks for a real outage.
- `README.md` — managed text around Upptime's generated status-table markers. Existing table content is preserved on sync.

Sync creates a commit on the current monitoring tip using its existing tree, never force-updates the branch, and retries if monitoring advances during publication. It neither checks out target files nor executes target code. Generated `history/` files and other unlisted files are left untouched. Keep the allowlist in `sync.py` explicit when adding or retiring a managed file.

Both monitoring workflows share the `upptime` concurrency group, use full-history checkouts and pinned Node 24-compatible actions, and finish within 15 minutes. Terraform restricts allowed actions to those exact SHAs; update the allowlist when changing a pin. Summary generation is an explicit step, so it does not depend on `GITHUB_TOKEN` pushes triggering another workflow ([GitHub behavior](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)). Template/dependency regeneration workflows are not installed.

## Setup and migration

1. Review and land the implementation in vigilant-broccoli's `main` using the normal Git workflow. Keep `upptime_migration_complete = false`; legacy checks and their existing bypass remain active until cutover. No commit or push is performed by the implementation tooling against this source checkout.
2. Run `pnpm tf:plan`, then apply the reviewed changes locally with `pnpm tf:apply`. This creates the monitoring repo, action restrictions, dedicated sync identity, source repo variables, and Vault role through post-apply. `upptime_sync_gh_app_id = 0` keeps the sync job disabled; new monitoring schedules stay gated by `UPPTIME_MONITORING_ENABLED = false`.
3. Register a new private GitHub App under the owning account: Contents read/write, Workflows read/write, all other optional permissions disabled, webhooks inactive, installed on **only** `iamharryliu/uptime`. Generate its private key ([GitHub registration guide](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app)). Set its public ID as `upptime_sync_gh_app_id` in `variables.tf`. Do not broaden or repurpose the old App that still bypasses `main`.
4. Store the downloaded key with `pnpm upptime:sync:store-key /absolute/path/app-key.pem`. The script validates the PEM and sends the key to Vault over the existing stdin-based SSH transport without printing it or putting it in command arguments. Remove the downloaded copy after secure storage. The sync key is deliberately outside shared `kv/secrets`; no new GitHub Actions secret is introduced.
5. Authenticate local GitHub/GCP tooling as needed. Use `gh auth setup-git` for HTTPS Git operations. Fetch the latest complete `main` history before exporting: `git fetch origin main` (use `git fetch --unshallow origin` first for a shallow checkout). Export only monitoring history, preserving commit timestamps:

   ```bash
   pnpm upptime:history:export /private/tmp/upptime-history.bundle refs/remotes/origin/main
   pnpm upptime:history:import /private/tmp/upptime-history.bundle iamharryliu/uptime
   ```

   Import runs against a temporary **bare** repo, adds only `history/` to the target tree, and attaches the filtered history as a merge parent. It refuses a target that already has history and pushes only a fast-forward update. It never checks out or runs target scripts and does not alter this checkout's refs or index. Import before the first monitoring run to avoid overwriting fresh data. The exporter defaults to `HEAD` for local verification; use the freshly fetched `origin/main` for actual cutover.

6. Apply the App-ID change with `pnpm tf:apply`, then run `pnpm gh:actions:sync-upptime`. Verify the managed files and repository identity in the destination. If changing the monitoring repo name, also update `UPTIME_REPO_NAME` in Pages Index's `src/app/consts/repo.ts` and the management scripts' default repository names.
7. Manually run both destination workflows and verify new history commits, refreshed `history/summary.json`, preserved long-term uptime/response-time data, and the Pages Index status view. Manual checks work while schedules are gated. Subscribe to incident issues in the new repo and verify alert delivery; existing issues remain in vigilant-broccoli as the incident archive. Avoid triggering a real service outage to check notifications.
8. Wait for old monitoring jobs to finish, then set `upptime_migration_complete = true` in `variables.tf` and apply the reviewed Terraform plan. This activates the new schedules, skips legacy jobs via `UPPTIME_MIGRATED`, and removes the old App's `main` bypass. Terraform changes are not atomic; inspect the resulting variables and ruleset and confirm the next scheduled run succeeds.
9. Uninstall/revoke the legacy Upptime App and delete `UPPTIME_GH_APP_PRIVATE_KEY` from shared Vault secrets after confirming it has no remaining users. Delete the legacy workflow files and their root README CI rows in a subsequent cleanup; retain legacy data until migration is verified. Remove the status page's 404 fallback once cutover is established so a deleted monitoring summary cannot silently show old results.

App creation/key generation and installation are account setup; Terraform manages repository configuration and applies stay local. Check provider credentials authorize managing the new repo. A failed or disabled sync must not be taken as evidence migration is complete.

## Operations

- Edit endpoints in the root `.upptimerc.yml`; a push to `main` syncs config automatically. Edit runtime workflows under `infrastructure/upptime/workflows/`, not the legacy copies under `.github/workflows/`.
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

- GitHub-hosted standard runners are free for public repositories ([GitHub billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)). Monitoring uses roughly 25 scheduled workflow runs per day; sync runs only on configuration changes or manual dispatch. No separate Upptime Pages site is provisioned; Pages Index continues displaying the public summary.
- The dedicated GCP service account and WIF provider add no VM. They reuse the existing Cloudflare Access secrets and Vault VM, adding only authentication/secret-read operations to the current services.
- No paid monitoring subscription or new persistent compute resource is required.
