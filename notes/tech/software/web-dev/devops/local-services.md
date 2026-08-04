# Local Services

Comparison of self-hosted/local solutions by category — software you run and operate yourself on your own VM or machine, as opposed to a managed cloud offering.

## Table of Contents

- [VPN / Private Networking](#vpn--private-networking)
- [Reverse Proxy / Web Server](#reverse-proxy--web-server)
- [Containers / Orchestration](#containers--orchestration)
- [Process Management](#process-management)
- [Secrets Management](#secrets-management)
- [Monitoring / Observability](#monitoring--observability)
- [Caching / Messaging](#caching--messaging)
- [Self-Hosted Applications](#self-hosted-applications)
- [Databases (Self-Hosted)](#databases-self-hosted)

## VPN / Private Networking

| Name      | Usage                                                         | Free Tier                       | When to Use                                                                        |
| --------- | ------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| WireGuard | Point-to-point encrypted VPN tunnel, self-managed keys/config | Free (self-hosted, open source) | Private network access into a specific VM — used to reach the GCP VM running Vault |

## Reverse Proxy / Web Server

| Name  | Usage                                              | Free Tier                       | When to Use                                                                                |
| ----- | -------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| Caddy | Reverse proxy with automatic HTTPS (Let's Encrypt) | Free (self-hosted, open source) | Default reverse proxy for self-hosted services needing zero-config TLS                     |
| Nginx | Reverse proxy / static web server                  | Free (self-hosted, open source) | Reverse proxy where explicit config control is preferred over Caddy's auto-TLS conventions |

## Containers / Orchestration

| Name           | Usage                                                         | Free Tier                       | When to Use                                                                                         |
| -------------- | ------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| Docker         | Container runtime                                             | Free (self-hosted, open source) | Default packaging/runtime for any self-hosted or deployed service                                   |
| Docker Compose | Multi-container orchestration on a single host                | Free (self-hosted, open source) | Homelab/VM stacks with multiple related containers (e.g. `infrastructure/local/docker-compose.yml`) |
| Watchtower     | Auto-updates running containers by polling for new image tags | Free (self-hosted, open source) | Keeping self-hosted containers (Gitea, code-server, RabbitMQ) current without manual redeploys      |

## Process Management

| Name | Usage                                                | Free Tier                       | When to Use                                                                                |
| ---- | ---------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| PM2  | Node.js process manager (restarts, logs, clustering) | Free (self-hosted, open source) | Running a Node app directly on a VM without containerizing it — used for `vb-manager-next` |

## Secrets Management

| Name            | Usage                                                             | Free Tier                       | When to Use                                                                        |
| --------------- | ----------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| HashiCorp Vault | Self-hosted secrets store with dynamic secrets, auth methods, TLS | Free (self-hosted, open source) | Source of truth for app/deploy secrets, reached via Cloudflare-Access-gated tunnel |

## Monitoring / Observability

| Name     | Usage                                                                       | Free Tier                                              | When to Use                                                                                              |
| -------- | --------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Grafana  | Dashboards/visualization over metrics and logs                              | Free (self-hosted, open source)                        | Visualizing Loki logs and any metrics sources on the homelab                                             |
| Loki     | Log aggregation, Grafana-native                                             | Free (self-hosted, open source)                        | Centralizing logs from self-hosted services without a heavier ELK-style stack                            |
| Promtail | Log shipping agent for Loki                                                 | Free (self-hosted, open source)                        | Pairs with Loki — ships container/VM logs to it                                                          |
| Upptime  | Static status-page + uptime monitor, config-as-code, runs on GitHub Actions | Free (open source, runs on own GitHub Actions minutes) | Public status checks/history for deployed services (`.upptimerc.yml`) without a hosted monitoring vendor |

## Caching / Messaging

| Name     | Usage                             | Free Tier                       | When to Use                                                                              |
| -------- | --------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| Redis    | In-memory cache / key-value store | Free (self-hosted, open source) | Caching or ephemeral state on a service already living on a VM                           |
| RabbitMQ | Message broker (AMQP)             | Free (self-hosted, open source) | Async messaging between fly.io services and the socket server — self-hosted on an OCI VM |

## Self-Hosted Applications

| Name        | Usage                                            | Free Tier                       | When to Use                                                                                                  |
| ----------- | ------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Gitea       | Self-hosted Git service (source-of-truth mirror) | Free (self-hosted, open source) | Git hosting independent of GitHub, gated behind Cloudflare Access                                            |
| Forejo      | Self-hosted Git service, community fork of Gitea | Free (self-hosted, open source) | Alternative to Gitea if community governance matters more than upstream feature velocity; not currently used |
| code-server | VS Code in the browser, self-hosted              | Free (self-hosted, open source) | Remote dev environment on a VM, gated behind Cloudflare Access                                               |
| Immich      | Self-hosted photo/video backup                   | Free (self-hosted, open source) | Private media backup without a third-party cloud photo service                                               |
| Adminer     | Lightweight web DB admin UI                      | Free (self-hosted, open source) | Ad hoc inspection of self-hosted Postgres/MySQL without installing a desktop client                          |

## Databases (Self-Hosted)

| Name       | Usage                                      | Free Tier       | When to Use                                                                                    |
| ---------- | ------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------- |
| PostgreSQL | Relational database, self-hosted on own VM | N/A (own infra) | Default relational store — avoids per-service managed DB cost                                  |
| MySQL      | Relational database, self-hosted on own VM | N/A (own infra) | Alternative relational store where MySQL-specific tooling/compat is needed; not currently used |
| SQLite     | Embedded file-based database               | N/A (own infra) | Small/simple apps needing zero-infra local persistence                                         |
| MongoDB    | Document database, self-hosted on own VM   | N/A (own infra) | Document-store workloads already running self-hosted                                           |
