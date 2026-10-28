# Local Infrastructure

Local k3s cluster, run by k3d, for self-hosted services (photos, logs, dashboards) behind Traefik. See [k3s-cluster.md](./docs/features/k3s-cluster.md).

## Table of Contents

- [Networking](#networking)
- [Observability](#observability)
- [Stack](#stack)

## Networking

- [manager.vigilant-broccoli.app](https://manager.vigilant-broccoli.app) - Main application
- [grafana.vigilant-broccoli.app](https://grafana.vigilant-broccoli.app) - Log dashboards
- [loki.vigilant-broccoli.app](https://loki.vigilant-broccoli.app) - Log aggregation
- [headlamp.vigilant-broccoli.app](https://headlamp.vigilant-broccoli.app) - Kubernetes dashboard
- [argocd.vigilant-broccoli.app](https://argocd.vigilant-broccoli.app) - GitOps sync of the cluster manifests
- [job-hunt.vigilant-broccoli.app](https://job-hunt.vigilant-broccoli.app) - Job Hunt app (proxied to the [job-hunt-next](../../projects/nx-workspace/apps/ui/job-hunt-next/) container via `host.k3d.internal:4300`)
- [images.vigilant-broccoli.app](https://images.vigilant-broccoli.app) - Immich photo management (proxied to the standalone [immich stack](../immich/) via `host.k3d.internal:2283`)

## Observability

### Log Flow

**Sources:**

- PM2 apps (local-manager-next) → `~/.pm2/logs/`
- Docker containers outside the cluster → Docker socket
- Cluster pods → Kubernetes API
- System logs → `/var/log/`

**Pipeline:**

1. Alloy reads the host paths and Docker socket that k3d mounts into the server node, and pod logs through the Kubernetes API
2. Sends to Loki via HTTP push API
3. Queryable in Grafana Explore (Loki datasource)

### Docker Log Configuration

**Apply via Docker Desktop UI:**
Preferences → Docker Engine → paste contents of `docker-daemon-config.json` → Apply & Restart

**Config:**

- `log-driver: json-file` — standard Docker logging
- `max-size: 10m` — rotate logs at 10MB
- `max-file: 3` — keep 3 log files (~30MB per container)
  **Why:** Alloy backfills each container's retained log on first start; Loki rejects entries older than its 7-day ingestion window, so smaller retained logs mean fewer rejected batches.

## Stack

- Language
  - YAML
  - Bash
- Tooling
  - Helm
  - k3d
  - k3s
  - k9s
  - kubectl
  - Kustomize
- Services
  - Alloy
  - Argo CD
  - Grafana
  - Headlamp
  - Loki
  - Prometheus
  - Traefik
