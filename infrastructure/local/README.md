# Local Infrastructure

## Services

- **manager.vigilant-broccoli.app** - Main application
- **adminer.vigilant-broccoli.app** - Database management
- **grafana.vigilant-broccoli.app** - Log dashboards
- **loki.vigilant-broccoli.app** - Log aggregation
- **sync.vigilant-broccoli.app** - Resilio Sync web interface
- **images.vigilant-broccoli.app** - Immich photo management

## Setup

```bash
./setup-certs.sh                                    # generate SSL certificates
docker-compose up -d                                # start all services
docker-compose down                                 # stop all services
npm run local:docker:restart [service]              # restart service(s)
```

## Grafana

Access: https://grafana.vigilant-broccoli.app

Loki datasource is pre-configured.

## Loki

Access: https://loki.vigilant-broccoli.app

Log aggregation with 30-day retention.

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
