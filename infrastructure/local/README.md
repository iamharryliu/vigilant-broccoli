# Local Infrastructure

## Services

- **manager.vigilant-broccoli.app** - Main application
- **adminer.vigilant-broccoli.app** - Database management
- **grafana.vigilant-broccoli.app** - Log dashboards
- **loki.vigilant-broccoli.app** - Log aggregation
- **sync.vigilant-broccoli.app** - Resilio Sync web interface
- **images.vigilant-broccoli.app** - Immich photo management

## Setup

```
./setup-certs.sh                        # generate SSL certificates
docker-compose up -d                     # start all services
docker-compose down                      # stop all services
docker-compose restart proxy             # restart nginx after config changes
```

## Grafana

Access: https://grafana.vigilant-broccoli.app

Loki datasource is pre-configured.

## Loki

Access: https://loki.vigilant-broccoli.app

Log aggregation with 30-day retention. Promtail collects:

- System logs from /var/log
- Docker container logs
