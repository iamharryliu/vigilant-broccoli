# Agent Sandbox

Dockerised Node.js sandbox that runs an autonomous Claude Code or Codex agent behind a locked-down egress firewall.

## Table of Contents

- [Shell and toolchain](#shell-and-toolchain)
- [Local Ollama agent](#local-ollama-agent)
- [Running in CI](#running-in-ci)
- [Publishing several pull requests](#publishing-several-pull-requests)
- [Auditing the backlog](#auditing-the-backlog)
- [Pruning dead code and stale docs](#pruning-dead-code-and-stale-docs)
- [Auditing legacy documentation](#auditing-legacy-documentation)
- [Auditing agent context](#auditing-agent-context)
- [Stack](#stack)

## Shell and toolchain

- Start the container with `pnpm agentic:dev-sandbox:up`, then open a CLI with one of:
  - `pnpm agentic:dev-sandbox:auto:claude`: Claude auto permission mode.
  - `pnpm agentic:dev-sandbox:auto:codex`: Codex workspace-write sandbox with on-request approvals and [Auto-review](https://developers.openai.com/codex/concepts/sandboxing/auto-review).
  - `pnpm agentic:dev-sandbox:yolo:claude`: Claude with permission checks bypassed.
  - `pnpm agentic:dev-sandbox:yolo:codex`: Codex with approvals and its sandbox disabled.
- Each command creates or reattaches its own `<agent>-<mode>` tmux session in the sandbox checkout. CLI arguments apply when creating the session; Claude defaults to Sonnet and accepts `--model <model>` overrides. Existing `cli` and `codexyolo` sessions are left running; the new commands use separate sessions.

- The image installs `zsh` from apt and a pinned `mise` (`MISE_VERSION` build arg in the Dockerfile) at `/usr/local/bin/mise`. Both are fetched at build time, outside the egress firewall.
- `agent` keeps bash as its login shell because the runners and entrypoint are bash scripts. The entrypoint runs `setup/linux/install.sh -y`, which hooks `setup/dotfiles/bash/.rc.bash` into `~/.bashrc` and `setup/dotfiles/zsh/.rc.linux.zsh` into `~/.zshrc`; both activate mise. Run `zsh` for an interactive zsh session with the repo aliases.
- Tool versions come from the root `mise.toml`. Run `mise install` in the checkout to fetch them; the default allowlist covers the hosts these tools download from: `mise.jdx.dev` and `mise-versions.jdx.dev` (version metadata), `releases.hashicorp.com` (Terraform, Packer), `nodejs.org` (Node) and the GitHub release asset hosts `objects.githubusercontent.com` and `release-assets.githubusercontent.com` (standalone Python). A newly pinned tool that downloads elsewhere needs its host added via `SANDBOX_ALLOWED_DOMAINS`, or run with the firewall off.

## Local Ollama agent

- Select local inference with `pnpm agentic-pr-create --agent ollama --prompt "<task>"` or `pnpm agentic-pr-create --local <TODO_ID...>`.
- The default is `qwen3-coder:30b`, Ollama's approximately 19 GB quantized coding model. It is a starting choice for an M3 MacBook Pro with 36 GB unified memory; actual memory use includes context, macOS and Docker. Run one solve at a time, close memory-heavy apps and inspect `ollama ps` and Activity Monitor for GPU offloading or swap. See the [model](https://ollama.com/library/qwen3-coder) and [context guidance](https://docs.ollama.com/context-length).
- Install Ollama on the Mac, then run `ollama pull qwen3-coder:30b`. Run inference natively for Metal acceleration; Docker runs the coding tools only. Quit the Ollama app (or `brew services stop ollama`) before starting the server manually to avoid a port conflict:
  ```bash
  OLLAMA_CONTEXT_LENGTH=65536 OLLAMA_NUM_PARALLEL=1 OLLAMA_FLASH_ATTENTION=1 OLLAMA_KV_CACHE_TYPE=q8_0 ollama serve
  ```
- Keep Ollama on its default `127.0.0.1` listener: Docker Desktop on macOS reaches it through its built-in `host.docker.internal`, and the LAN cannot. On Linux the adapter adds `--add-host host.docker.internal:host-gateway`, which only a non-loopback listener answers, so there set `OLLAMA_HOST=0.0.0.0:11434`; that exposes Ollama to the LAN, so restrict port 11434 with the host firewall (Ollama's API has no authentication). The sandbox keeps its egress firewall enabled and allows the host Ollama port.
- Ollama uses the image's existing Claude Code tool harness through its [Anthropic-compatible API](https://docs.ollama.com/integrations/claude-code). Model inference is free and self hosted; no Claude subscription or model API credentials are needed. Local mode rejects cloud tags and cloud-backed models, strips model-provider credentials and disables the harness's nonessential traffic and hosted web tools. GitHub and package registries remain available for checkout and tooling; this is not an offline sandbox.
- Preview runs do not fetch Vault credentials, commit, push or open PRs. Each run clones fresh remote main into a separate checkout under the printed `/tmp/vb-local-solve.*` directory, retaining code, `.git/solve-meta.json` and `run.log` after success or failure. Your current checkout and uncommitted edits are not inputs. Review with `git -C <printed-checkout> diff`; preview runs implement only the first increment and record follow-ups in metadata.
- `--agent ollama --publish` explicitly enables the existing GitHub PR/increment pipeline, using an exported `GH_TOKEN` or the existing Vault GitHub credentials. It still uses only the local model. TODO jobs run sequentially in both modes to limit inference memory pressure.
- Override the model with `--ollama-model <local-tag>` or `OLLAMA_MODEL`; override the host port with `OLLAMA_BASE_URL=http://host.docker.internal:<port>`. The model must already be pulled and support tools. The adapter rebuilds the Docker image and checks model availability before every batch. `--local` is shorthand for `--agent ollama`; Actions retains its existing hosted agent choices.

## Running in CI

Plan- and Develop-phase agents, backlog auditing, documentation and context auditing and pruning load their task instructions from the canonical `setup/dotfiles/agent-skills/<name>/SKILL.md` files (`agentic-pr-create-todo-audit`, `agentic-pr-create-audit`, `agentic-pr-create-context-audit`, `agentic-pr-create-prune`, `agentic-pr-create-todo`, `agentic-pr-create-rnd`, `agentic-pr-create`, `agentic-pr-update`, `agentic-pr-update-fix-ci`, `agentic-pr-update-resolve-conflicts`) used by local agent sessions. The runners add sandbox execution rules and PR metadata requirements; they own branching, validation, commits, pushes and PR creation. Editing a shared skill updates both execution paths. The Actions, Docker Sandbox and Local entry points of one operation share one task contract; the differences that are intentional (Actions' prompt-only create input versus local per-id batching, Claude-only operations, hosted summaries and email) are listed in [entry-point parity](../../docs/agent-support.md#entry-point-parity).

`pnpm agentic-pr-create <ID...>` runs `solve-todo.sh` locally. The same solve runs in GitHub Actions via the
`manual-agentic-pr-create` workflow (`workflow_dispatch`) — it builds and runs this container on the `ubuntu-24.04`
runner, so no local machine is needed. `solve-todo.sh` is shared verbatim: when the workflow supplies the selected
agent credential (`CLAUDE_CODE_OAUTH_TOKEN` for Claude, `AGENT_CODEX_ACCESS_TOKEN` for Codex) plus the GitHub App credentials
from Vault, the script skips the local Vault-over-SSH load and mints the installation token itself.

- Dispatch: `gh workflow run manual-agentic-pr-create.yml -f prompt="<task>"`, with optional `-f agent=claude|codex`,
  `-f model=` for Claude, `-f codex_model=` for Codex, and `-f firewall=off`. The workflow has no separate TODO id input:
  mention ids in the prompt (`-f prompt="solve a1b2c3"`) and the agent resolves those `TODO.md` rows and the runner removes the ones it fully resolved
  once done. Use `pnpm agentic-pr-create <id...>` locally to solve several ids as parallel runs, one per id (each may itself publish more than one PR).
- Smoke test: dispatch `manual-agentic-pr-create-smoke` (`gh workflow run manual-agentic-pr-create-smoke.yml`) to run the whole
  pipeline against a canned one-line prompt and check the notification email. Pass `-f agent=codex` to smoke-test the
  Codex path. It opens a disposable PR; close it after.
- Notification: the workflow emails the outcome with each PR's title, summary, link, base and full diff, rendered as a
  GitHub-style patch, and lists any planned increment that was not published. The runner prints one record per PR
  (`PR_TITLE::`, `PR_URL::`, `PR_STATE::`, `PR_BASE::`, `PR_DEPENDS_ON::`, `PR_SUMMARY_*` and `PR_DIFF_BEGIN`/`PR_DIFF_END`),
  `solve-todo.sh` collects them into a JSON Lines file, and `.github/scripts/agentic-solve-email.mjs` renders and sends it.

`pnpm agentic-pr-create-rnd "<question>"` runs `create-rnd.sh` locally. The `manual-agentic-pr-create-rnd` workflow runs the same command
on a hosted runner using the existing Claude and GitHub App credentials from Vault. It researches the question,
writes a new note under `docs/rnd/`, and opens a PR; changes outside `docs/rnd/` fail the run.

- GitHub UI: **Actions → manual-agentic-pr-create-rnd → Run workflow** on `main`; enter a research question and optionally choose a model
  (default `sonnet`) or disable the firewall.
- CLI: `gh workflow run manual-agentic-pr-create-rnd.yml -f question="<question>"`, with optional `-f model=opus` or `-f firewall=off`.
- Runs queue behind an active R&D run; the job has a 60-minute timeout. The PR link is written to the run's job summary.

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

`pnpm agentic-pr-update --with-ci-logs <pr> "<instruction>"` makes `update-pr-runner.sh` collect `gh pr checks` and the failed-step logs (`gh run view --log-failed`) of the branch's recent failing runs, add them to the prompt within a 20 KB budget split across the failing runs (an over-budget run keeps the first third and the rest from its end). The agent cannot run `gh` itself, so this is how it sees why CI failed. Checks still running are waited on for up to 10 minutes (`CI_WAIT_SECONDS`) first. `manual-agentic-pr-update` exposes this as the `with_ci_logs` input. Without it, a `change` run still lists the PR's failing, cancelled and pending check names in the prompt (no logs), so the agent reports a branch that already fails CI instead of building on it silently.

`pnpm agentic-pr-update --operation fix-ci <pr> ["<instruction>"]` is also used by `manual-agentic-pr-update` with `operation=fix-ci`. It implies `--with-ci-logs`, uses a fixed CI-fix instruction with the optional instruction appended as extra guidance, and selects the shared CI-fix skill. A failing PR-title check (commitlint) is fixed through the optional `pr_title` metadata field, which the runner normalizes and applies with `gh pr edit --title`; a title-only fix exits successfully without a commit.

A `change` instruction can be TODO-only: naming a `TODO.md` row id and asking to drop it (a stale row, or one that was never checked off) is valid with no other file change. The agent declares the id in `todo_ids`, and the runner validates that the request names it and that the row exists, removes it and commits the removal. `agentic-pr-create` still requires real changes beyond `TODO.md`.

`pnpm agentic-pr-update --operation resolve-conflicts <pr>` is also used by `manual-agentic-pr-update` with `operation=resolve-conflicts`. It accepts no instruction, enables the merge of `origin/main`, and selects the shared conflict-resolution skill in the existing PR-update runner.

## Publishing several pull requests

`pnpm agentic-pr-create` (and its `manual-agentic-pr-create` workflow) and the change operation of `pnpm agentic-pr-update`
(`manual-agentic-pr-update`) share `pr-increments.sh`, sourced by `solve-todo-runner.sh` and `update-pr-runner.sh`. A simple
task is still one PR. When the first agent run judges the request too large or bundled, it implements the first increment and
lists the rest in an `increments` array in its metadata file (contract in
[agent support](../../docs/agent-support.md#increment-contract)). The runner then:

- validates the whole plan before publishing anything (at most 4 later increments, unique ids, one earlier prerequisite each,
  TODO ids that exist, are named in the request and are assigned once) and fails the run on a bad plan, saving the first
  increment's work as a draft PR;
- publishes the first increment, then runs a fresh agent per later increment on its own branch: an independent one from
  `origin/main` targeting `main`, a dependent one from its prerequisite's branch targeting that branch, so its diff is only its
  own increment even where several increments edit the same file;
- removes from `TODO.md` only the rows each increment declares in `todo_ids`, on that increment's branch, and fails an
  increment that deleted any other row;
- gives every PR its own title, summary, next steps, suggestions and history row, plus a `## Stack` section with the merge
  order, refreshed on every PR once all are open;
- stops at the first failing increment, saves its partial work as a draft PR, prints `INCREMENT_UNPUBLISHED::` for it and
  every increment not attempted, and exits non-zero, leaving the PRs already opened in place. Later increments run
  sequentially in the same container, so the workflow's 60-minute timeout covers the whole set.

`update-pr-runner.sh` does the same for follow-ups an update surfaces, leaving the target PR to its own purpose; fix-CI and
conflict-resolution updates never split. If the target update fails before its push, recovery uses a separate draft branch
targeting the original PR branch. Recovery restores unresolved TODO rows and respects commit hooks; if hooks or GitHub
publication fail, the log reports that recovery failed rather than claiming the work was saved. Git, pushes and PR creation stay in the runner with the credentials it already
has; branches are only created and pushed, never force-pushed. Squash-merge implications of stacked PRs are in
[Stacked pull requests](../../docs/git-workflow.md#stacked-pull-requests). The container copies `solve-todo-runner.sh`,
`pr-increments.sh` and `commit-subject.sh` into the image, so rebuild it (`docker compose build`) after changing any of them when running locally. Every runner sources `commit-subject.sh` to capitalize commit messages and PR titles, end them with a period and strip trailing ellipses, so they pass the CI `commitlint` job.

## Auditing the backlog

`pnpm agentic-pr-create-todo "<description>"` runs `create-todo.sh`. It refines the initial request using repo research, writes one actionable TODO entry, and includes the refined prompt in the PR summary. Use `/agentic-pr-create-todo <description>` locally; there is no dedicated Actions workflow.

`pnpm agentic-pr-create-todo-audit` runs `audit-todo.sh`, the counterpart to `create-todo.sh`: instead of adding a row it
re-verifies the ones already there against the current tree, deleting rows whose problem is genuinely fixed and correcting
rows whose paths, line numbers, counts or scope have drifted. `cron-agentic-pr-create-todo-audit` runs the same script weekly.

- Dispatch: `gh workflow run cron-agentic-pr-create-todo-audit.yml` (optional `-f model=`, `-f firewall=off`).
- A clean audit opens no PR — `audit-todo-runner.sh` prints `AUDIT_CLEAN` and exits 0 rather than raising an empty PR.
- The runner refuses to commit if an id disappeared without being reported as resolved, if an id was added or renumbered,
  or if any file other than `TODO.md` changed. Ids are the handle `pnpm agentic-pr-create <id>` resolves, so a table
  rewrite that quietly drops one is treated as a failure, not a diff to review.

## Pruning dead code and stale docs

`pnpm agentic-pr-create-prune` runs `prune.sh`, which sweeps the whole tree for dead code, unused dependencies, broken
doc links and anchors, orphaned docs, scripts and workflows, and cheatsheet drift, then opens one PR removing only what a
repo-wide grep shows has zero references. `cron-agentic-pr-create-prune` runs the same script weekly.

- Dispatch: `gh workflow run cron-agentic-pr-create-prune.yml` (optional `-f model=`, `-f firewall=off`).
- A clean run opens no PR — `prune-runner.sh` prints `PRUNE_CLEAN` and exits 0 rather than raising an empty PR.
- The runner refuses to commit if `TODO.md`, a `migrations/` directory or Terraform state changed, if a file under
  `notes/` was added, deleted or renamed, or if more than 50 files changed. The skill asks for about 40; the runner's cap
  is the backstop that keeps a runaway sweep from becoming an unreviewable PR.

The `AGENTS.md` adapters are committed symlinks to `CONTEXT.md`, which Claude Code reads directly from v2.1.277 (the image installs at least that version), so the entrypoint's clone carries them and no step regenerates them per branch. The entrypoint still runs the Linux installer to install the shared skills. See [agent support](../../docs/agent-support.md).

## Auditing legacy documentation

`pnpm agentic-pr-create-audit` runs `audit-docs.sh`, which audits `docs/`, every `CONTEXT.md` and `README.md` and
code-adjacent docs for passages about legacy implementations that no longer apply, then opens one PR removing them or
rewriting them to the current state. It runs Opus by default (`--model` overrides). `manual-agentic-pr-create-audit`
runs the same script on dispatch; it has no schedule.

- Dispatch: `gh workflow run manual-agentic-pr-create-audit.yml` (optional `-f model=`, `-f firewall=off`).
- A clean run opens no PR — `audit-docs-runner.sh` prints `AUDIT_CLEAN` and exits 0.
- The runner refuses to commit if any non-Markdown file changed, if `notes/`, `docs/rnd/`, `docs/learning-timeline.md`,
  `TODO.md` or a changelog changed, or if more than 15 files changed. The skill fills the cap highest-value first and
  lists the rest as skipped in the PR body, so a re-run picks them up.

## Auditing agent context

`pnpm agentic-pr-create-context-audit` runs `audit-context.sh`, which slims every `CONTEXT.md`, shared skill body and
root Doc Map or required-reading document by replacing restated rules with links to their owner and compressing incident narratives, then
opens one PR citing where each removed fact is retained. It runs Opus by default (`--model` overrides).
`cron-agentic-pr-create-context-audit` runs the same script weekly.

- Dispatch: `gh workflow run cron-agentic-pr-create-context-audit.yml` (optional `-f model=`, `-f firewall=off`).
- A clean run opens no PR — `audit-context-runner.sh` prints `AUDIT_CLEAN` and exits 0.
- The runner refuses to commit if any file outside that scope changed (including `notes/`, `docs/rnd/`,
  `docs/learning-timeline.md` and `TODO.md`), if a file was created, deleted or changed type (an adapter symlink
  rewritten as a regular file), if a `SKILL.md` frontmatter block changed, or if more than 15 files changed.

## Stack

- Language - Bash
- Tooling
  - Docker
  - Docker Compose
  - mise
  - Zsh
- Cloud providers
  - GitHub
- Services
  - Claude Code
  - Codex CLI
  - Ollama
- Secrets
  - Google Secret Manager
  - HashiCorp Vault
