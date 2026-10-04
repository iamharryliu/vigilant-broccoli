# Agent Sandbox

Dockerised Node.js sandbox that runs an autonomous Claude Code or Codex agent behind a locked-down egress firewall.

## Table of Contents

- [Running in CI](#running-in-ci)
- [Auditing the backlog](#auditing-the-backlog)
- [Stack](#stack)

## Running in CI

`pnpm agentic:task:solve <ID...>` runs `solve-todo.sh` locally. The same solve runs in GitHub Actions via the
`manual-agentic-solve` workflow (`workflow_dispatch`) — it builds and runs this container on the `ubuntu-24.04`
runner, so no local machine is needed. `solve-todo.sh` is shared verbatim: when the workflow supplies the selected
agent credential (`CLAUDE_CODE_OAUTH_TOKEN` for Claude, `AGENT_CODEX_ACCESS_TOKEN` for Codex) plus the GitHub App credentials
from Vault, the script skips the local Vault-over-SSH load and mints the installation token itself.

- Dispatch: `gh workflow run manual-agentic-solve.yml -f ids="<id> <id>"` (or `-f prompt="<task>"`), with optional
  `-f agent=claude|codex`, `-f model=` for Claude, `-f codex_model=` for Codex, and `-f firewall=off`.
- Smoke test: dispatch `manual-agentic-solve-smoke` (`gh workflow run manual-agentic-solve-smoke.yml`) to run the whole
  pipeline against a canned one-line prompt and check the notification email. Pass `-f agent=codex` to smoke-test the
  Codex path. It opens a disposable PR; close it after.
- Notification: the workflow emails the outcome with each PR's title, summary, link and full diff, rendered as a
  GitHub-style patch. `solve-todo-runner.sh` prints the diff between `PR_DIFF_BEGIN`/`PR_DIFF_END` markers, `solve-todo.sh`
  collects the markers into a JSON Lines file, and `.github/scripts/agentic-solve-email.mjs` renders and sends it.

`pnpm agentic:rnd "<question>"` runs `create-rnd.sh` locally. The `manual-agentic-rnd` workflow runs the same command
on a hosted runner using the existing Claude and GitHub App credentials from Vault. It researches the question,
writes a new note under `docs/rnd/`, and opens a PR; changes outside `docs/rnd/` fail the run.

- GitHub UI: **Actions → manual-agentic-rnd → Run workflow** on `main`; enter a research question and optionally choose a model
  (default `sonnet`) or disable the firewall.
- CLI: `gh workflow run manual-agentic-rnd.yml -f question="<question>"`, with optional `-f model=opus` or `-f firewall=off`.
- Runs queue behind an active R&D run; the job has a 60-minute timeout. The PR URL appears in the research step's logs.

Codex uses a dedicated ChatGPT/Codex access token, not the app's `OPENAI_API_KEY`:

1. In ChatGPT workspace settings, create a dedicated Codex service account for agentic CI, or create a personal Codex
   access token if the workspace policy allows that instead.
2. Create an access token with the Codex/local-access scope and the shortest practical expiration.
3. Put that service account or user in the workspace groups/roles whose Codex usage limits you want the agent to follow.
   Platform API keys use separate API billing; use this access-token path when you want ChatGPT/Codex limits.
4. Store the full token in Vault:

   ```sh
   vault kv patch ${VAULT_KV_PATH:-kv/data/secrets} AGENT_CODEX_ACCESS_TOKEN='...'
   ```

Use this ChatGPT-managed Codex auth only for private/trusted workflows; do not use it for public or open-source
GitHub-hosted workflows.

The egress firewall allows `api.openai.com`, `auth.openai.com` and `chatgpt.com` for this path. `chatgpt.com` sits
behind a CDN and `init-firewall.sh` resolves the allowlist into an ipset once at container start, so a long solve can
outlive the addresses it captured; if a Codex run dies mid-way on network errors, retry with `-f firewall=off`.

`codex exec` has no tool deny-list equivalent to Claude's `--disallowedTools`, so the Codex branch of
`solve-todo-runner.sh` runs it with `GH_TOKEN`/`GITHUB_TOKEN` stripped from the environment. Branching, committing,
pushing and opening the PR stay with the runner for both agents.

## Auditing the backlog

`pnpm agentic:task:audit [sections]` runs `audit-todo.sh`, the counterpart to `create-todo.sh`: instead of adding a row it
re-verifies the ones already there against the current tree, deleting rows whose problem is genuinely fixed and correcting
rows whose paths, line numbers, counts or scope have drifted. `cron-agentic-todo-audit` runs the same script weekly.

- Dispatch: `gh workflow run cron-agentic-todo-audit.yml` (optional `-f scope="Security Performance"`, `-f model=`, `-f firewall=off`).
- A clean audit opens no PR — `audit-todo-runner.sh` prints `AUDIT_CLEAN` and exits 0 rather than raising an empty PR.
- The runner refuses to commit if an id disappeared without being reported as resolved, if an id was added or renumbered,
  or if any file other than `TODO.md` changed. Ids are the handle `pnpm agentic:task:solve <id>` resolves, so a table
  rewrite that quietly drops one is treated as a failure, not a diff to review.

The `CLAUDE.md` and `AGENTS.md` adapters are committed symlinks to `CONTEXT.md`, so the entrypoint's clone carries them and no step regenerates them per branch. The entrypoint still runs the Linux installer to install the shared skills. See [agent support](../../docs/agent-support.md).

## Stack

- Language - Bash
- Tooling
  - Docker
  - Docker Compose
- Services
  - Claude Code
  - Codex CLI
- Cloud providers
  - GitHub
- Secrets
  - HashiCorp Vault
  - Google Secret Manager
