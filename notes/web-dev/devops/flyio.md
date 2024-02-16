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
fly secrets set [env variable]=[val] --stage
fly deploy --dockerfile [docker-file] --config [config-file] --ha=false
```

```
fly secrets set [KEY]=[VALUE]
fly secrets list
fly secrets deploy
```

```
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

## Troubleshooting

- Make sure you have set all environment variables before deploying.

## References

- [Fly IO Monorepo](https://fly.io/docs/reference/monorepo/)

## Todo

- FlyIO destroy and create apps
