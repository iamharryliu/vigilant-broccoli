# Repo Operations

Decision-making map for LLM agents: infrastructure operations, data/persistence, local dev environment, and auth. Companion to [app-development.md](./app-development/app-development.md) (where a new app, lib, or deploy destination goes).

## Table of Contents

- [Infrastructure Operations](#infrastructure-operations)
- [Data & Persistence Map](#data--persistence-map)
- [Local Dev Environment](#local-dev-environment)
- [Auth Patterns](#auth-patterns)

## Infrastructure Operations

Rule of thumb: check `docs/cheatsheet.md` before hand-rolling SSH or cloud commands.

- **IaC** — `infrastructure/terraform/`: OCI VMs (Gitea, code-server, RabbitMQ — provisioned via cloud-init yamls), the GCP VM (Vault + WireGuard), Cloudflare DNS, GitHub repo config. Driven by `pnpm tf:plan` / `tf:apply` / `tf:post-apply` / `tf:output`. VM images built with Packer (`infrastructure/terraform/packer/`, `pnpm gcp:vm:image:build`).
- **OCI VMs** — `pnpm oci:vm:ssh`, `gitea:ssh`, `code-server:*` (ssh, logs, password, open). code-server is cattle: `code-server:replace` / `reset`, or the `manual-replace-code-server` workflow (`pnpm gh:actions:replace-code-server`); it bootstraps by cloning this repo and running `setup/linux/install.sh -y`. Its toolchain is baked into a derived image (`infrastructure/code-server/Dockerfile`) that `deploy-code-server-image` pushes to Docker Hub as `iamharryliu/vb-code-server`, rather than installed per container start. cloud-init pulls it anonymously (the VM holds no Docker Hub credentials), so before replacing the VM the image must exist and its Docker Hub repo must stay public, or there is nothing to pull. `var.code_server_image` tracks `:latest`; point it at a published `sha-<commit>` tag to pin or roll back. A systemd timer (`code-server-update.timer`, from cloud-init) runs `docker compose pull` and `up -d` every 15 minutes, so a new `:latest` reaches the VM without a replace and recreates the container (ending live tmux sessions); a VM provisioned before the timer existed needs one replace to get it. Inside the container `git push` and `gh` authenticate as the agent sandbox's GitHub App, which can push branches and open PRs but has no `main` bypass. The VM never holds the App's key: `pnpm gh:actions:refresh-code-server-github-token` (the `manual-refresh-code-server-github-token` workflow, CI twin of `agentic:dev-sandbox:refresh-github-token`) mints a 1-hour token and drops it on the VM over SSH, and `git push`/`gh` tell you to re-run it once it has expired. Claude Code is pre-authenticated with the same `CLAUDE_CODE_OAUTH_TOKEN` the agent sandbox uses, delivered via Terraform/cloud-init, so `code-server:replace` is how a rotated token reaches the VM. `pnpm agentic-pr-create --vm` launches unattended solves there from the workstation, one worktree and tmux session each ([VM adapter](../infrastructure/agent-sandbox/README.md#running-on-the-code-server-vm)).
- **GCP VM (Vault + WireGuard)** — `pnpm gcp:vm:*`: status/start/stop, `vault:unseal` / `vault:seal` (Vault seals on restart — unseal before debugging "Vault unreachable"), `regen-cert`, `update-wg`.
- **AWS VMs** — `pnpm seafile:*`, `immich:*`, `grafana:*` (ssh, logs, password, open, `replace` / `reset`). All three are cloud-init-driven with their state on a separate EBS volume, so `replace` is safe (see `aws-*.tf`).
- **Homelab Pi (Jellyfin)** — bare metal on the home LAN, so nothing in Terraform owns it: `infrastructure/jellyfin-pi/` is an idempotent Ansible playbook (`pnpm jellyfin:provision`, `provision:check`, plus `ssh` / `status` / `logs` / `docker:*`). Reachable only over the tailnet, not the public internet. Full runbook — prerequisites, variables, from-scratch sequence, replacement Pi — in [jellyfin-pi.md](./infrastructure/jellyfin-pi.md).
- **Observability** — Grafana + Loki + Alloy on the AWS `grafana-vm` (`aws-grafana.tf`, `cloud-init-grafana.yaml`), UI at `grafana.harryliu.dev` behind Cloudflare Access, admin login via `pnpm grafana:password`. Fly app logs (every app in the org, staging and production) reach it through the `vb-log-shipper` fly app (`deployment-configs/fly-configs/log-shipper.toml`, `pnpm logs:shipper:deploy`) pushing to `loki.harryliu.dev` with basic auth (`LOKI_PUSH_PASSWORD`, Terraform-minted and synced to Vault by `tf:post-apply`). The VM ships its own container logs via Alloy. Dashboards are JSON files in `infrastructure/terraform/grafana-dashboards/`, synced to the VM's persistent data volume by `pnpm grafana:dashboards:push` (not cloud-init, so edits never replace the VM; the repo is authoritative and a removed file removes its dashboard). **Fastify services** charts request rate, status codes, 5xx rate, p50/p95/p99 latency, slowest routes, 401/403/429 and error lines from `requestLoggerPlugin`'s JSON lines (`status`, `latency_ms`, `route`), defaulting to `production-vb-express`; **Honeypot** counts `honeypot_triggered` lines and `/contact/send-message` status codes per `fly_app_name`. Query anything else in Explore with LogQL, e.g. `{fly_app_name="production-vb-express"} |= "honeypot_triggered"`. Loki keeps 30 days.
- **Observability self-monitoring** — a systemd timer on the VM (`observability-health.sh`, every 5 min) checks free space on both disks, that all five containers are running, and that Loki received at least one Fly app log line in the last 6 hours (`fly-logs-stale`; healthy traffic has ~4.5h silent stretches), then toggles a marker file that nginx serves at `https://loki.harryliu.dev/health` as 200 or 503. Upptime polls that URL, so a full disk or a crashed container opens a GitHub issue. The disk and container checks are deliberately independent of Grafana and Loki, since a full disk is what breaks those two first; the Fly-log query fails closed (`fly-logs-unreadable`). It exists because `vb-log-shipper` fails silently: a rejected `ACCESS_TOKEN` makes Vector exit 78 until Fly stops the machine, which once cost weeks of logs. `pnpm logs:shipper:deploy` starts a stopped shipper machine (a plain `flyctl deploy` leaves it stopped) and fails if it is not still running 60s later. It also appends a logfmt line to `/var/log/observability-health.log` which Alloy ships, so `{job="health"} | logfmt | unwrap data_used_pct` charts disk use over time. Loki's `limits_config` caps ingestion rate and stream count, and `/etc/docker/daemon.json` rotates container logs, so a runaway producer can't fill either disk before the check fires. `grafana.harryliu.dev` itself is not an Upptime entry: it sits behind Cloudflare Access, which answers an unauthenticated probe with a login page and HTTP 200, so the check would pass even with the origin down.
- **Workflow triggers from CLI** — `pnpm gh:actions:deploy | health-check | kill-services | run-tests | replace-code-server | refresh-code-server-github-token`.

Architecture diagrams: [infrastructure.md](./infrastructure/infrastructure.md).

## Data & Persistence Map

Where state lives, per app:

| Store | Used by | Notes |
| --- | --- | --- |
| Supabase Postgres | `hearth` | Migrations via `scripts/migrate.ts --migrations-dir=...` (`SUPABASE_DB_PASSWORD`) |
| MongoDB (`vb-manager` db) | `vb-manager-next` | `MONGODB_URI` |
| SQLite on a fly volume | `vb-express`, `office-presence-service` (demo) | `[mounts]` in its fly config, `DATABASE_PATH` (`OFFICE_PRESENCE_DB` for the Slack service) |
| Cloudflare R2 buckets | `hearth` (`home-docs`, `where-is` buckets), `bucket-service` | Private buckets in `infrastructure/terraform/main.tf`; bucket names may predate app renames |
| Gitea (`git.harryliu.dev`) | journal, strandbaden repos | Self-hosted on OCI |
| External drive on the Pi | Jellyfin (homelab Pi) | Media library at `/mnt/media/library` (fstab by UUID), config on internal storage. Exempt from the backup rule below — LAN-only, unreachable from CI, and bulk media is not dump-shaped ([jellyfin-pi.md](./infrastructure/jellyfin-pi.md)) |
| R2 bucket `nx-cache` | Nx self-hosted remote cache (`nx-cache.harryliu.dev` Cloudflare Worker) | Not app data — 7-day lifecycle-expired build cache, exempt from the backup rule below |

Backups: `cron-backup.yml` runs nightly, one job per store (repo zip, Gitea repos, mongodump, pg_dump) into `gs://vigilant-broccoli-backup`, keeping the last 7. **A new persistent store must get a backup job there**, and a matching restore job in `test-smoke-backup-restore.yml`, which weekly restores each dump into a throwaway container and fails on a stale or unrestorable backup.

## Local Dev Environment

- `infrastructure/local/k3s/` — local k3d (k3s in Docker) cluster: Traefik HTTPS proxy with local certs via `setup-certs.sh`, Grafana, Loki, Prometheus, Alloy and Headlamp, synced from `main` by Argo CD. Managed with `pnpm local:k3s:*`; guide in [k3s-cluster.md](../infrastructure/local/docs/features/k3s-cluster.md).
- `infrastructure/immich/docker-compose.yml` — standalone Immich stack (server, machine-learning, Redis, Postgres) exposed on `:2283`; the local cluster's Traefik proxies `images.vigilant-broccoli.app` to it via `host.k3d.internal:2283`. Managed with `pnpm immich:docker:up|down|restart|reload|logs`.
- Mock backends for UI development live under `apps/api/mock/` (e.g. `mock-employee-handler-service`) — prefer extending a mock over pointing local UIs at live services.
- Running a service with real secrets locally: use its `serve` target (Vault-wrapped; see [app-development.md](./app-development/app-development.md#choosing-a-home)).

## Auth Patterns

- **Service-to-service / CI-to-service**: `SHARED_APP_TOKEN` bearer token (socket server, deploy notifications, e2e tests). `vb-express` uses its own `VB_EXPRESS_API_KEY`. Both rotate via the `rotate-secrets` workflow; after rotation sync the socket-server VM (`pnpm oci:vm:sync-socket-token`).
- **User-facing**: owned by [supabase-auth-pattern.md](./app-development/ui/auth/supabase-auth-pattern.md).
