# Repo Operations

Decision-making map for LLM agents: infrastructure operations, secrets, data/persistence, local dev environment, and auth. Companion to [repo-patterns.md](./repo-patterns.md) (app develop/test/CI/deploy lifecycle).

## Infrastructure Operations

Rule of thumb: check `docs/cheatsheet.md` before hand-rolling SSH or cloud commands.

- **IaC** — `infrastructure/terraform/`: OCI VMs (Gitea, code-server, RabbitMQ — provisioned via cloud-init yamls), the GCP VM (Vault + WireGuard), Cloudflare DNS, GitHub repo config. Driven by `pnpm tf:plan` / `tf:apply` / `tf:post-apply` / `tf:output`. VM images built with Packer (`infrastructure/terraform/packer/`, `pnpm gcp:vm:image:build`).
- **OCI VMs** — `pnpm oci:vm:ssh`, `gitea:ssh`, `code-server:*` (ssh, logs, password, open). code-server is cattle: `code-server:replace` / `reset`, or the `manual-replace-code-server` workflow (`pnpm gh:actions:replace-code-server`); it bootstraps by cloning this repo and running `setup/linux/install.sh -y`.
- **GCP VM (Vault + WireGuard)** — `pnpm gcp:vm:*`: status/start/stop, `vault:unseal` / `vault:seal` (Vault seals on restart — unseal before debugging "Vault unreachable"), `regen-cert`, `update-wg`.
- **Workflow triggers from CLI** — `pnpm gh:actions:deploy | health-check | kill-services | run-tests | replace-code-server`.

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

Backups: `cron-backup.yml` runs nightly, one job per store (repo zip, Gitea repos, mongodump, pg_dump) into `gs://vigilant-broccoli-backup`, keeping the last 7. **A new persistent store must get a backup job there.**

## Local Dev Environment

- `infrastructure/local/docker-compose.yml` — local service stack (Grafana, Prometheus, Loki/Promtail, Resilio, nginx with local certs via `setup-certs.sh`). Managed with `pnpm local:docker:up|down|restart|reload`.
- `infrastructure/immich/docker-compose.yml` — standalone Immich stack (server, machine-learning, Redis, Postgres) exposed on `:2283`; local nginx proxies `images.vigilant-broccoli.app` to it via `host.docker.internal:2283`. Managed with `pnpm immich:docker:up|down|restart|reload|logs`.
- Mock backends for UI development live under `apps/api/mock/` (e.g. `mock-employee-handler-service`) — prefer extending a mock over pointing local UIs at live services.
- Running a service with real secrets locally: use its `serve` target (Vault-wrapped; see repo-patterns.md).

## Auth Patterns

- **Service-to-service / CI-to-service**: `SHARED_APP_TOKEN` bearer token (socket server, deploy notifications, e2e tests). `vb-express` uses its own `VB_EXPRESS_API_KEY`. Both rotate via the `rotate-secrets` workflow; after rotation sync the socket-server VM (`pnpm oci:vm:sync-socket-token`).
- **User-facing**: owned by [supabase-auth-pattern.md](./ui/auth/supabase-auth-pattern.md).
