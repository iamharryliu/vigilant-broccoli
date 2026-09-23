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
- Smoke test: dispatch `manual-agentic-solve-smoke` (`gh workflow run manual-agentic-solve-smoke.yml`) to run the whole
  pipeline against a canned one-line prompt and check the notification email. It opens a disposable PR; close it after.
- Notification: the workflow emails the outcome with each PR's title, summary, link and full diff, rendered as a
  GitHub-style patch. `solve-todo-runner.sh` prints the diff between `PR_DIFF_BEGIN`/`PR_DIFF_END` markers, `solve-todo.sh`
  collects the markers into a JSON Lines file, and `.github/scripts/agentic-solve-email.mjs` renders and sends it.

## Auditing the backlog

`pnpm agentic:task:audit [sections]` runs `audit-todo.sh`, the counterpart to `create-todo.sh`: instead of adding a row it
re-verifies the ones already there against the current tree, deleting rows whose problem is genuinely fixed and correcting
rows whose paths, line numbers, counts or scope have drifted. `cron-agentic-todo-audit` runs the same script weekly.

- Dispatch: `gh workflow run cron-agentic-todo-audit.yml` (optional `-f scope="Security Performance"`, `-f model=`, `-f firewall=off`).
- A clean audit opens no PR — `audit-todo-runner.sh` prints `AUDIT_CLEAN` and exits 0 rather than raising an empty PR.
- The runner refuses to commit if an id disappeared without being reported as resolved, if an id was added or renumbered,
  or if any file other than `TODO.md` changed. Ids are the handle `pnpm agentic:task:solve <id>` resolves, so a table
  rewrite that quietly drops one is treated as a failure, not a diff to review.

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
