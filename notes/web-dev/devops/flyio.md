# FlyIO

## Commands

```
fly version update
fly settings autoupdate enable
fly doctor
flyctl logs --config [config-file]
```

```
fly launch
fly launch --no-deploy
fly apps list
fly apps destroy [app-name]
```

```
fly secrets set [KEY]=[VALUE]
fly secrets set [KEY]=[VALUE] --stage
fly secrets list
fly secrets deploy
fly deploy --ha=false
fly deploy --dockerfile [docker-file] --config [config-file]

flyctl status --config
flyctl machine status [machine_id]
flyctl machine start --config [config_file]
flyctl machine stop --config [config_file]
flyctl scale count [n] --config [config_file]
flyctl logs --config [config_file]
```

### SSH

Issue new credential.

```
fly ssh issue -d
fly ssh issue --agent
fly ssh console --config [config_file]
```

### Postgres

```
flyctl postgres create
flyctl postgres connect -a [db-name]
flyctl proxy 5432 -a [db-name]

fly ips list --app [app-name]
fly ips allocate-v4 --app [app-name]
fly ips allocate-v4 --app [app-name] --shared
```

## Troubleshooting

- Make sure you have set all environment variables before deploying.

## References

- [Fly IO Monorepo](https://fly.io/docs/reference/monorepo/)
- [Setup Postgres](https://medium.com/data-folks-indonesia/setup-free-postgresql-on-fly-io-and-import-database-3f8f891cbc71)
