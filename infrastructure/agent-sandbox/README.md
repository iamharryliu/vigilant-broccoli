# Agent Sandbox

Dockerised Node.js sandbox that runs an autonomous Claude Code agent behind a locked-down egress firewall.

## Table of Contents

- [Running in CI](#running-in-ci)
- [Stack](#stack)

## Running in CI

`pnpm agentic:task:solve <ID...>` runs `solve-todo.sh` locally. The same solve runs in GitHub Actions via the
`manual-agentic-solve` workflow (`workflow_dispatch`) — it builds and runs this container on the `ubuntu-latest`
runner, so no local machine is needed. `solve-todo.sh` is shared verbatim: when the workflow supplies
`CLAUDE_CODE_OAUTH_TOKEN` + the GitHub App credentials from Vault, the script skips the local Vault-over-SSH load and
mints the installation token itself.

- Dispatch: `gh workflow run manual-agentic-solve.yml -f ids="<id> <id>"` (or `-f prompt="<task>"`), with optional
  `-f model=` and `-f firewall=off`.

## Stack

- Language - Bash
- Tooling
  - Docker
  - Docker Compose
- Services
  - Claude Code
- Cloud providers
  - GitHub
- Secrets
  - HashiCorp Vault
  - Google Secret Manager
