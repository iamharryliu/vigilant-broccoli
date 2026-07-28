# Local Infrastructure

Docker Compose stack for self-hosted local services (photos, logs, dashboards) behind an nginx proxy.

## Stack

- Language - YAML
- Tooling
  - Docker Compose
- Services
  - nginx
  - Immich
  - PostgreSQL
  - Redis
  - Adminer
  - Loki
  - Promtail
  - Grafana
  - Resilio Sync

## Services

- **manager.vigilant-broccoli.app** - Main application
- **adminer.vigilant-broccoli.app** - Database management
- **grafana.vigilant-broccoli.app** - Log dashboards
- **loki.vigilant-broccoli.app** - Log aggregation
- **sync.vigilant-broccoli.app** - Resilio Sync web interface
- **images.vigilant-broccoli.app** - Immich photo management

### Log Flow

**Sources:**

- PM2 apps (vb-manager-next) → `/Users/harryliu/.pm2/logs/`
- Docker containers → json-file driver logs
- System logs → `/var/log/`

**Pipeline:**

1. Promtail scrapes logs from mounted volumes and Docker socket
2. Sends to Loki via HTTP push API
3. Queryable in Grafana Explore (Loki datasource)

### Docker Log Configuration

**Apply via Docker Desktop UI:**
Preferences → Docker Engine → paste contents of `docker-daemon-config.json` → Apply & Restart

**Config:**

- `log-driver: json-file` — standard Docker logging
- `max-size: 10m` — rotate logs at 10MB
- `max-file: 3` — keep 3 log files (~30MB per container)
  **Why:** Prevents old logs from exceeding Loki's 3-day retention, causing timestamp rejection errors.
