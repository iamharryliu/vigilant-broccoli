# Repo Operations

Decision-making map for LLM agents: infrastructure operations, secrets, data/persistence, local dev environment, and auth. Companion to [repo-patterns.md](./repo-patterns.md) (app develop/test/CI/deploy lifecycle).

## Infrastructure Operations

Rule of thumb: check `docs/cheatsheet.md` before hand-rolling SSH or cloud commands.

- **IaC** — `infrastructure/terraform/`: OCI VMs (Gitea, code-server, RabbitMQ — provisioned via cloud-init yamls), the GCP VM (Vault + WireGuard), Cloudflare DNS, GitHub repo config. Driven by `pnpm tf:plan` / `tf:apply` / `tf:post-apply` / `tf:output`. VM images built with Packer (`infrastructure/terraform/packer/`, `pnpm gcp:vm:image:build`).
- **OCI VMs** — `pnpm oci:vm:ssh`, `gitea:ssh`, `code-server:*` (ssh, logs, password, open). code-server is cattle: `code-server:replace` / `reset`, or the `manual-replace-code-server` workflow (`pnpm gh:actions:replace-code-server`); it bootstraps by cloning this repo and running `setup/linux/install.sh -y`. Its toolchain is baked into a derived image (`infrastructure/code-server/Dockerfile`) that `deploy-code-server-image` pushes to Docker Hub as `iamharryliu/vb-code-server`, rather than installed per container start. cloud-init pulls it anonymously (the VM holds no Docker Hub credentials), so before replacing the VM the image must exist and its Docker Hub repo must stay public, or there is nothing to pull. `var.code_server_image` tracks `:latest`; point it at a published `sha-<commit>` tag to pin or roll back. Inside the container `git push` and `gh` authenticate as the agent sandbox's GitHub App, which can push branches and open PRs but has no `main` bypass. The VM never holds the App's key: `pnpm gh:actions:refresh-code-server-github-token` (the `manual-refresh-code-server-github-token` workflow, CI twin of `agentic:dev-sandbox:refresh-github-token`) mints a 1-hour token and drops it on the VM over SSH, and `git push`/`gh` tell you to re-run it once it has expired. Claude Code is pre-authenticated with the same `CLAUDE_CODE_OAUTH_TOKEN` the agent sandbox uses, delivered via Terraform/cloud-init, so `code-server:replace` is how a rotated token reaches the VM.
- **GCP VM (Vault + WireGuard)** — `pnpm gcp:vm:*`: status/start/stop, `vault:unseal` / `vault:seal` (Vault seals on restart — unseal before debugging "Vault unreachable"), `regen-cert`, `update-wg`.
- **AWS VMs** — `pnpm seafile:*`, `immich:*`, `grafana:*` (ssh, logs, password, open, `replace` / `reset`). All three are cloud-init-driven with their state on a separate EBS volume, so `replace` is safe (see `aws-*.tf`).
- **Observability** — Grafana + Loki + Alloy on the AWS `grafana-vm` (`aws-grafana.tf`, `cloud-init-grafana.yaml`), UI at `grafana.harryliu.dev` behind Cloudflare Access, admin login via `pnpm grafana:password`. Fly app logs (every app in the org, staging and production) reach it through the `log-shipper` fly app (`deployment-configs/fly-configs/log-shipper.toml`, `pnpm logs:shipper:deploy`) pushing to `loki.harryliu.dev` with basic auth (`LOKI_PUSH_PASSWORD`, Terraform-minted and synced to Vault by `tf:post-apply`). The VM ships its own container logs via Alloy. The provisioned **Honeypot** dashboard counts `honeypot_triggered` lines and `/contact/send-message` status codes per `fly_app_name`; query anything else in Explore with LogQL, e.g. `{fly_app_name="production-vb-express"} |= "honeypot_triggered"`. Loki keeps 30 days.
- **Workflow triggers from CLI** — `pnpm gh:actions:deploy | health-check | kill-services | run-tests | replace-code-server | refresh-code-server-github-token`.

Architecture diagrams: [infrastructure.md](./infrastructure/infrastructure.md).

## Secret Lifecycle

All of it — hierarchy, per-tier key inventory, CI and local Vault access, rotation commands and per-key mechanisms — lives in [secret-management.md](./infrastructure/secret-management.md). Read it before touching a secret.

## Data & Persistence Map

Where state lives, per app:

| Store                      | Used by                                                                 | Notes                                                                                 |
| -------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Supabase Postgres          | `hearth`                                                                | Migrations via `scripts/migrate.ts --migrations-dir=...` (`SUPABASE_DB_PASSWORD`)     |
| MongoDB (`vb-manager` db)  | `vb-manager-next`                                                       | `MONGODB_URI`                                                                         |
| SQLite on a fly volume     | `vb-express`                                                            | `[mounts]` in its fly config, `DATABASE_PATH`                                         |
| Cloudflare R2 buckets      | `hearth` (`home-management` bucket), `bucket-service`                   | Bucket names may predate app renames                                                  |
| Gitea (`git.harryliu.dev`) | journal, strandbaden repos                                              | Self-hosted on OCI                                                                    |
| R2 bucket `nx-cache`       | Nx self-hosted remote cache (`nx-cache.harryliu.dev` Cloudflare Worker) | Not app data — 7-day lifecycle-expired build cache, exempt from the backup rule below |

Backups: `cron-backup.yml` runs nightly, one job per store (repo zip, Gitea repos, mongodump, pg_dump) into `gs://vigilant-broccoli-backup`, keeping the last 7. **A new persistent store must get a backup job there**, and a matching restore job in `test-smoke-backup-restore.yml`, which weekly restores each dump into a throwaway container and fails on a stale or unrestorable backup.

## Local Dev Environment

- `infrastructure/local/docker-compose.yml` — local service stack (Grafana, Prometheus, Loki/Promtail, Resilio, nginx with local certs via `setup-certs.sh`). Managed with `pnpm local:docker:up|down|restart|reload`.
- `infrastructure/immich/docker-compose.yml` — standalone Immich stack (server, machine-learning, Redis, Postgres) exposed on `:2283`; local nginx proxies `images.vigilant-broccoli.app` to it via `host.docker.internal:2283`. Managed with `pnpm immich:docker:up|down|restart|reload|logs`.
- Mock backends for UI development live under `apps/api/mock/` (e.g. `mock-employee-handler-service`) — prefer extending a mock over pointing local UIs at live services.
- Running a service with real secrets locally: use its `serve` target (Vault-wrapped; see repo-patterns.md).

## Auth Patterns

- **Service-to-service / CI-to-service**: `SHARED_APP_TOKEN` bearer token (socket server, deploy notifications, e2e tests). `vb-express` uses its own `VB_EXPRESS_API_KEY`. Both rotate via the `rotate-secrets` workflow; after rotation sync the socket-server VM (`pnpm oci:vm:sync-socket-token`).
- **User-facing**: owned by [supabase-auth-pattern.md](./ui/auth/supabase-auth-pattern.md).
