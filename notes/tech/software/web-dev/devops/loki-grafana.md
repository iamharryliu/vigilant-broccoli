# Loki + Grafana

Self-hosted log aggregation: Loki stores and indexes log streams by label, Grafana queries them with LogQL and draws dashboards, and an agent (Alloy, or a platform-specific shipper) pushes lines in.

## Table of Contents

- [Stack](#stack)
- [Free Tier](#free-tier)
- [Shipping Logs](#shipping-logs)
- [LogQL Cheatsheet](#logql-cheatsheet)
- [Gotchas](#gotchas)
- [References](#references)

## Stack

| Component | Role                                                              | Notes                                                                                                                      |
| --------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Alloy     | Collector: tails files/containers, relabels, pushes to Loki       | Successor to Promtail (EOL March 2026); config is River syntax (`discovery.docker`, `loki.source.docker`, `loki.write`)    |
| Grafana   | UI: Explore, dashboards, alerting                                 | Provision datasources and dashboards from files under `/etc/grafana/provisioning` so a fresh container comes up configured |
| Loki      | Log store: index on labels only, chunks on disk or object storage | Single-binary mode with filesystem storage is fine for one VM; `auth_enabled: false` means no tenant header is needed      |
| nginx     | Optional auth shim in front of Loki's push API                    | Loki has no built-in auth — put basic auth (or mTLS) in front before exposing `/loki/api/v1/push` to remote clients        |

## Free Tier

- All four components are open source and free to self-host; the only cost is the VM and disk they run on (see [EC2](./aws/ec2.md#free-tier), [Fly.io](./flyio.md#free-tier)).
- Grafana Cloud's hosted free tier (50 GB logs/month, 14-day retention, 3 users) is the alternative when a VM is more trouble than it is worth.

## Shipping Logs

- **Containers on the same host** — Alloy with `discovery.docker` + `loki.source.docker` over the Docker socket; relabel `__meta_docker_container_name` to a `container` label.
- **Fly.io apps** — [fly-log-shipper](https://github.com/superfly/fly-log-shipper) is a Vector image that subscribes to the org's NATS log stream and pushes to a Loki sink with basic auth (`LOKI_URL`, `LOKI_USERNAME`, `LOKI_PASSWORD`; `ACCESS_TOKEN` is a read-only org token). One app covers every app in the org; labels arrive as `fly_app_name`, `fly_region`, `fly_app_instance`, `host`, `level`. JSON log lines are flattened into fields, so `| json` works in LogQL.
- **Vercel / Cloudflare** — log drains to an HTTP endpoint; put a small receiver in front of Loki, since neither speaks the Loki push format natively.
- Keep label cardinality low: app, region, level, container. Request ids and user ids belong in the line, not in labels.

## LogQL Cheatsheet

```
{fly_app_name="production-api"} |= "honeypot_triggered"                        # substring filter
{fly_app_name=~"staging-.+"} | json | status="403"                              # parse JSON line, filter a field
sum(count_over_time({app="api"} |= "honeypot_triggered" [$__range]))            # single number for a stat panel
sum by (fly_app_name) (count_over_time({app=~".+"} |= "x" [$__auto]))           # per-app bar chart
sum by (status) (count_over_time({app="api"} | json | path="/contact" [1h]))    # status breakdown
rate({container="nginx"} |= "error" [5m])                                       # errors per second
```

`$__range`, `$__auto`, and `$__interval` are Grafana variables; use `[$__range]` with an instant query for totals and `[$__auto]` for time series.

## Gotchas

- Bind-mounted data directories need the container uids: Grafana runs as `472`, Loki as `10001`. A root-owned mount makes Loki crash-loop with permission errors.
- Retention needs the compactor with `retention_enabled: true`; `retention_period` alone does nothing.
- Basic auth via `htpasswd`: `openssl passwd -apr1` produces a hash nginx accepts without installing `apache2-utils`. Generating the hash in Terraform (`bcrypt()`) re-salts every plan and churns anything that embeds it.
- The Vector Loki sink used by fly-log-shipper only supports basic auth, so an identity-aware proxy that expects custom headers (Cloudflare Access service tokens, for instance) cannot sit in front of the push URL.
- Provisioned dashboards are read-only in the UI unless `allowUiUpdates: true`; edit the JSON at the source instead.
- A full disk takes Loki and Grafana down together, so an alert that queries Loki to report low disk space goes silent exactly when it fires. Check disk from outside the stack — a timer writing a marker file that a web server turns into a health status works, and any external uptime monitor can then poll it.
- Bound the inflow as well as watching the outflow: `limits_config.ingestion_rate_mb`, `ingestion_burst_size_mb` and `max_global_streams_per_user` stop one looping producer filling the volume. Container logs land on the host's root disk, not Loki's, so set `log-opts.max-size`/`max-file` in `/etc/docker/daemon.json` too.
- An nginx `proxy_pass` to a literal container name is resolved at startup, so nginx refuses to boot while that container is down. Use `resolver 127.0.0.11` with the host in a variable to defer resolution to request time, so a status endpoint on the same server stays reachable when the backend is not.

## References

- [Loki configuration](https://grafana.com/docs/loki/latest/configure/)
- [Alloy components](https://grafana.com/docs/alloy/latest/reference/components/)
- [LogQL](https://grafana.com/docs/loki/latest/query/)
- [Grafana provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [fly-log-shipper](https://github.com/superfly/fly-log-shipper)
