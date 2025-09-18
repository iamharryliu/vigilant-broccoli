# Github

```
gh auth login  
gh auth refresh -h github.com -s admin:org

# CREATE
gh api -X PUT /orgs/ORG_NAME/memberships/USERNAME
# READ
gh api /orgs/ORG_NAME/invitations
gh api /orgs/ORG_NAME/members --paginate  
gh api /orgs/ORG_NAME/outside_collaborators
# UPDATE
gh api -X PUT /orgs/ORG_NAME/memberships/USERNAME -f role=member
# DELETE
gh api -X DELETE /orgs/ORG_NAME/members/USERNAME
```

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
