# Repo Operations

Decision-making map for LLM agents: infrastructure operations, secrets, data/persistence, local dev environment, and auth. Companion to [repo-patterns.md](./repo-patterns.md) (app develop/test/CI/deploy lifecycle).

## Infrastructure Operations

Rule of thumb: check `docs/cheatsheet.md` before hand-rolling SSH or cloud commands.

- **IaC** — `infrastructure/terraform/`: OCI VMs (Gitea, code-server, RabbitMQ — provisioned via cloud-init yamls), the GCP VM (Vault + WireGuard), Cloudflare DNS, GitHub repo config. Driven by `pnpm tf:plan` / `tf:apply` / `tf:post-apply` / `tf:output`. VM images built with Packer (`infrastructure/terraform/packer/`, `pnpm gcp:vm:image:build`).
- **OCI VMs** — `pnpm oci:vm:ssh`, `oci:gitea:ssh`, `oci:code-server:*` (ssh, logs, password, open). code-server is cattle: `oci:code-server:replace` / `reset`, or the `manual-replace-code-server` workflow (`pnpm gh:actions:replace-code-server`); it bootstraps by cloning this repo and running `setup/linux/install.sh -y`.
- **GCP VM (Vault + WireGuard)** — `pnpm gcp:vm:*`: status/start/stop, `vault:unseal` / `vault:seal` (Vault seals on restart — unseal before debugging "Vault unreachable"), `regen-cert`, `update-wg`.
- **Homelab** — `infrastructure/homelab/` compose stack (Caddy); `pnpm homelab:up|down|restart|logs|ps|pull`.
- **Workflow triggers from CLI** — `pnpm gh:actions:deploy | health-check | kill-services | run-tests | replace-code-server`.

Architecture diagrams: [infrastructure.md](./infrastructure/infrastructure.md).

## Secret Lifecycle

Authority: [secret-management.md](./infrastructure/secret-management.md) — hierarchy, full key inventory, rotation procedures. Working summary:

- Chain: Google account > GCP Secret Manager (Tier 0: Vault root token, unseal keys, WireGuard keys, cloudflared tunnel token) > Vault (`kv/data/secrets`, on the GCP VM) > deploy secrets > app secrets.
- **CI access**: Vault at `https://vault.harryliu.dev` (cloudflared tunnel, Cloudflare Access service token) + GitHub OIDC JWT auth, via `.github/actions/vault-secrets`. That action authenticates to GCP via Workload Identity Federation and pulls the Cloudflare Access token (`VAULT_CF_ACCESS_CLIENT_ID` / `VAULT_CF_ACCESS_CLIENT_SECRET`) from Secret Manager, so the only plain GitHub secrets are `GCP_WORKLOAD_IDENTITY_PROVIDER` / `GCP_SERVICE_ACCOUNT` (the WIF bootstrap) plus `GH_PAT` / `PROFILE_REPO_DEPLOY_KEY`.
- **Local access**: scripts fetch the Vault token from Secret Manager (`scripts/gcp-vault-token.ts`) with `NODE_EXTRA_CA_CERTS=./scripts/vault-ca.crt`.
- **Per-service fly secrets**: wired by `projects/nx-workspace/scripts/secrets-mapping.config.ts` (env-less `flyAppBaseName`) + each service's `.env.example`, pushed by `deploy-flyio-secrets.ts <project> [staging|production]` (`deploy:secrets` / `deploy:secrets:production` targets), which composes `<env>-<base>` and creates the fly app first if it does not exist yet. Both environments read the same Vault path — per-env secret values would need per-env vault paths.
- **Rotation**: `pnpm secret-rotation:all` — runs the scripted rotations locally (Fly token — needs a `fly` user session; Gitea CI token; profile-repo deploy key) then dispatches the `rotate-secrets` workflow, which verifies `FLY_API_TOKEN`, regenerates `SHARED_APP_TOKEN` / `VB_EXPRESS_API_KEY`, and redeploys; the rest is manual rotate-at-source then `vault kv patch`. The rotate scripts push live secrets to the `staging-*` fly apps only — production apps pick up rotated values on their next `deploy:production` (extend the scripts' app lists once production is live).

## Data & Persistence Map

Where state lives, per app:

| Store                      | Used by                                               | Notes                                                                        |
| -------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| Supabase Postgres          | `hearth`                                              | Migrations via `scripts/migrate.ts --migrations-dir=...` (`SUPABASE_DB_URL`) |
| MongoDB (`vb-manager` db)  | `vb-manager-next`                                     | `MONGODB_URI`                                                                |
| SQLite on a fly volume     | `vb-express`                                          | `[mounts]` in its fly config, `DATABASE_PATH`                                |
| Cloudflare R2 buckets      | `hearth` (`home-management` bucket), `bucket-service` | Bucket names may predate app renames                                         |
| Gitea (`git.harryliu.dev`) | journal, strandbaden repos                            | Self-hosted on OCI                                                           |

Backups: `cron-backup.yml` runs nightly, one job per store (repo zip, Gitea repos, mongodump, pg_dump) into `gs://vigilant-broccoli-backup`, keeping the last 7. **A new persistent store must get a backup job there.**

## Local Dev Environment

- `infrastructure/local/docker-compose.yml` — local service stack (Grafana, Prometheus, Loki/Promtail, Immich, Resilio, nginx with local certs via `setup-certs.sh`). Managed with `pnpm local:docker:up|down|restart|reload`.
- Mock backends for UI development live under `apps/api/mock/` (e.g. `mock-employee-handler-service`) — prefer extending a mock over pointing local UIs at live services.
- Running a service with real secrets locally: use its `serve` target (Vault-wrapped; see repo-patterns.md).

## Auth Patterns

- **Service-to-service / CI-to-service**: `SHARED_APP_TOKEN` bearer token (socket server, deploy notifications, e2e tests). `vb-express` uses its own `VB_EXPRESS_API_KEY`. Both rotate via the `rotate-secrets` workflow; after rotation sync the socket-server VM (`pnpm oci:vm:sync-socket-token`).
- **User-facing**: Supabase auth with Google provider (`hearth`, `employee-handler-ui`, `small-business-next`, `vb-manager-next`) — one shared Supabase project/user pool, redirect URLs Terraform-managed. See [supabase-auth-pattern.md](../projects/nx-workspace/docs/auth/supabase-auth-pattern.md).
