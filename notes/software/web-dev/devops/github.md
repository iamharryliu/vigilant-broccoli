# Github

## Github Actions

```
on:
  workflow_dispatch
  push: { branches: ['main'] }
  schedule: [{ cron: '* * * * *' }]
```

- [Github Profile Metrics](https://github.com/lowlighter/metrics/blob/master/.github/readme/partials/documentation/setup/action.md)

## Github CLI

- [Getting Started](https://cli.github.com/manual/)
- [Setting Secrets](https://cli.github.com/manual/gh_secret_set)

```
gh auth login
gh secret set <secret-name> [flags]
```
