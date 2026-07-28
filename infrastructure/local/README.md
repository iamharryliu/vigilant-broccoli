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
  - Ollama

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

### Ollama (Local LLM)

Reachable at `http://localhost:11434`, not proxied through nginx (API-only, no subdomain).

Pull a model after first `docker compose up`:

```
docker exec -it ollama ollama pull qwen3:8b
```

**Why `qwen3:8b`:** Docker Desktop on macOS runs containers in a Linux VM with no access to Apple's Metal API, so this container always runs inference on CPU regardless of the host's GPU/unified memory. `qwen3:8b` is a reasonable default for CPU inference; for GPU-accelerated speed on larger models (e.g. `qwen3:14b`, `qwen3-coder:30b`), run Ollama natively on the Mac host instead (`brew install ollama`) rather than through this container.
