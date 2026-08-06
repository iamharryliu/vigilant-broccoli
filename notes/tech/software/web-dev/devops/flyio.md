# FlyIO

## Free Tier

- Organizations created on Pay As You Go after 2024-10-07 get **no free allowance** — everything below is billed. Legacy Hobby/Launch/Scale orgs keep up to 3 `shared-cpu-1x` 256MB VMs and 3GB total volume storage.
- IPs — relevant when locking an app to the private 6PN network:
  - Shared IPv4: free (one per app).
  - Anycast IPv6: free, unlimited.
  - Flycast (private IPv6, `fly ips allocate-v6 --private`): free — private-only apps cost nothing in IP terms.
  - Dedicated IPv4: $2/mo — the only IP that costs money, so release it when an app goes private.
- Machines: `shared-cpu-1x` 256MB ≈ $0.0028/hr (~$2.02/mo if always on). `auto_stop_machines = 'stop'` with `min_machines_running = 0` is what keeps idle services near $0.
- Volumes: $0.15/GB/mo provisioned (billed hourly). Snapshots $0.08/GB/mo, first 10GB/mo free.
- Bandwidth: inbound and same-region transfer free; North America/Europe egress $0.02/GB. Service-to-service calls over flycast stay on the private network and skip egress billing.

## Commands

```
fly version update
fly settings autoupdate enable
fly doctor

# Provision
fly launch
fly launch --no-deploy
fly apps list
fly apps create APP_NAME
fly apps destroy APP_NAME
fly apps open --app APP_NAME

# Deploy
fly deploy --ha=false
fly deploy --dockerfile DOCKER_FILE --config CONFIG_FILE

# Secrets
fly secrets set [KEY]=[VALUE]
fly secrets set [KEY]=[VALUE] --stage
fly secrets list
fly secrets deploy

# Debug
flyctl logs --app APP_NAME

# Scale
flyctl status --app [app_name]
flyctl machine status [machine_id]
flyctl machine start --app [app_name]
flyctl machine stop --app [app_name]
flyctl scale count [n] --app [app_name]

# Token
flyctl auth token # Authentication token
flyctl tokens create deploy # Application token
```

### SSH

Issue new credential.

```
fly ssh issue --dotssh
fly ssh issue --agent
fly ssh console --app [app_name]
```

### Postgres

```
flyctl postgres create
flyctl postgres connect --app [db-name]
flyctl proxy 5432 --app [db-name]

fly ips list --app [app_name]
fly ips allocate-v4 --app [app_name]
fly ips allocate-v4 --app [app_name] --shared

# Connection
psql postgres://postgres:[password]@[appname].internal:5432/[db]
psql postgresql://postgres:[password]@localhost:5432/[db]
psql postgres://postgres:[password]@testsql.flycast:5432/[db]
# Backup
fly postgres list
fly volumes list -a [app_name]
fly volumes snapshots list [volume_id]
fly postgres create --snapshot-id [snapshot_id]
fly postgres detach [db_name]
fly postgres attach [restrored_db_name]
```

### DNS

```
fly certs add [domain_name] --app [app_name]
fly certs remove [domain_name] --app [app_name]
fly certs list --app [app_name]
fly certs show [hostname] --app [app_name]
```

## Fly Cron

```
# Dockerfile

...

RUN apt-get update
RUN apt-get install -y cron
COPY etc/crontab /app/etc/crontab

COPY run.sh /app/run.sh
RUN ["chmod", "+x", "/app/run.sh"]
CMD /app/run.sh
```

```
# crontab

SHELL=/bin/sh
* * * * * echo "hit" >> /code/cron.log
```

```
# run.sh

{
  echo "SECRET=${SECRET}"
} >> /etc/environment

set -e
crontab /app/etc/crontab
cron

...

```

## Troubleshooting

- Make sure you have set all environment variables before deploying.

## References

- [Fly IO Monorepo](https://fly.io/docs/reference/monorepo/)
- [Connecting to Postgres App](https://fly.io/docs/postgres/connecting/app-connection-examples/)
- [Setup Postgres](https://medium.com/data-folks-indonesia/setup-free-postgresql-on-fly-io-and-import-database-3f8f891cbc71)
- [External Connections](https://fly.io/docs/postgres/connecting/connecting-external/)
- [Python App](https://fly.io/docs/languages-and-frameworks/python/)
- [Github Actions](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/)
