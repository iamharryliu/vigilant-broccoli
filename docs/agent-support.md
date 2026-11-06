# Agent Support

Shared context, skills and execution contracts for repository agents.

## Table of Contents

- [Sources and adapters](#sources-and-adapters)
- [Agentic commands](#agentic-commands)
  - [Dispatch contract](#dispatch-contract)
- [Entry-point parity](#entry-point-parity)
  - [Task contract](#task-contract)
  - [Execution adapters](#execution-adapters)
  - [Intentional differences](#intentional-differences)
  - [Maintenance rule](#maintenance-rule)
- [Adding a context source or skill](#adding-a-context-source-or-skill)
- [Installing skills](#installing-skills)
- [Context discovery](#context-discovery)
- [Documentation placement](#documentation-placement)

## Sources and adapters

| Source | Adapter |
| --- | --- |
| Root and directory `CONTEXT.md` | Adjacent `AGENTS.md` relative symlink |
| `setup/dotfiles/agent-skills/<name>/SKILL.md` | Relative command symlinks under `setup/dotfiles/.claude/commands/` |
| Shared skill directories | Installed links in `~/.agents/skills/` and `~/.claude/skills/` |

Edit canonical sources, not adapters. Skills reference owning docs rather than copying conventions. Personal Codex configuration remains outside the repo; skill UI metadata lives in `agents/openai.yaml`. A globally installed repo skill operates on the current vigilant-broccoli checkout, never its installation checkout by default.

## Agentic commands

Operations use `agentic-<resource>-<verb>[-<variant>]` for the root pnpm script; their skill and command use `local-<verb>-<resource>[-<variant>]` because they run in a local session (`agentic-pr-create-audit` → `local-create-pr-audit`, `agentic-pr-update` → `local-update-pr`). Skills that dispatch Actions use `gh-`. Claude invokes `/name`; Codex invokes `$name`. Actions adds `manual-`/`cron-` or routes related operations through a selector: `manual-agentic-pr-update` selects `change`, `fix-ci` or `resolve-conflicts`.

Task policy belongs in the canonical `SKILL.md`. Runners load it before PR checkout (older branches may lack it) and embed it in prompts. Runners own checkout setup, credentials, merge preparation, metadata, validation and publishing; skills state preparation needed only in local sessions. Local invocation alone does not authorize publishing. Agentic workflows use the [shared run summary](./ci/workflow-conventions.md#agentic-run-summaries).

Maintenance scopes differ: inventory audit fixes rows of the fork identity and secret inventories, README refresh (skill `update-readmes`) edits only READMEs and generated repo counts, comment audit removes redundant comments and generator scaffolding without code changes, free-tier audit adds or corrects documented free-tier limits from verifiable sources, prune removes verified dead code/docs, URL audit syncs public URL registries (Upptime, pages-index, quick links) and published Docker image listings (pages-index registry, README Containers), audit corrects obsolete/inaccurate documentation and misplaced leaf documentation, context audit slims agent guidance and repairs ownership without losing facts, TODO audit changes only backlog rows, and [refactor cleanup](./refactor-code-cleanup.md) reviews only the current diff. Smoke is Actions-only. Deterministic maintenance such as dependency pin drift (`cron-dependency-pin-drift`) uses a script, not an agent, so it has no `agentic-` command or skill.

`local-session-status` (`$local-session-status` in Codex, `/local-session-status` in Claude) gives one brief, read-only status snapshot of dispatches known in the invoking conversation. Explicit session names, branches/worktrees, PRs, Actions run identifiers or Docker launch log paths can select jobs when conversation history is unavailable. It does not enumerate unrelated sessions or control jobs, and has no Actions/Docker runner equivalent. The [canonical skill](../setup/dotfiles/agent-skills/local-session-status/SKILL.md) defines evidence and reporting rules.

`local-session-retry-publish` (`$local-session-retry-publish` in Codex, `/local-session-retry-publish` in Claude) notifies selected existing idle agents to retry already authorized publishing after a reported credential refresh. It shares status provenance boundaries and has no Actions/Docker equivalent. See the [canonical skill](../setup/dotfiles/agent-skills/local-session-retry-publish/SKILL.md) for selection, safe submission and limitations.

### Dispatch contract

Every dispatcher (`gh-`, `local-docker-`, `remote-` and the tmux `local-` create/update skills) shares this front end; each skill adds only its medium's dispatch.

1. **Request:** take it from the arguments; without arguments use the change the conversation most recently identified as worth building, and ask if none stands out.
2. **Research (read-only):** the affected code and existing patterns, applicable `CONTEXT.md` files and [Doc Map](../CONTEXT.md#doc-map) docs, and overlapping `TODO.md` rows and open PRs (`gh pr list`).
3. **Stop:** when the request should not be built (already done, out of scope or wrong for the repo), do not dispatch; give the reason per the [no-change decisions](#task-contract). If an existing TODO row covers it, name the row ID and suggest dispatching it by ID. If the request only drops existing TODO rows without resolving them, dispatch one run per ID with the prompt exactly `Remove TODO.md row <id>. Reason: <reason>` ([TODO references](#task-contract)); free text that deletes rows fails the runner's undeclared-removal check. Together they count as the one authorized dispatch.
4. **Ask:** only questions whose answer materially changes scope or outcome (which app/lib owns it, public vs private lib, new app vs pages-index page, a new public URL, a breaking change), through the harness's structured question tool: at most 4, each with the recommended option first. Record anything with a sensible default as a stated assumption. Ask nothing when nothing blocks.
5. **Write a self-contained prompt:** the agent sees only the repo, not the conversation. Include the problem and why it matters, the desired behavior, cited paths and quoted snippets or symbols (never line numbers, except in the update variant below), existing patterns to follow, user decisions and constraints, ruled-out options and acceptance checks. Scope the task to one pull request; describe a larger one as ordered increments in a `TODO.md` row ([todo-pattern.md](./todo-pattern.md)) for a human to dispatch one run at a time.
6. **Model:** a model the user names (`--model <model>` or in words) is passed through verbatim. Otherwise pick by task complexity and state the choice with a one-line reason in the report:

   | Tier | Claude | Codex reasoning effort | Task shape |
   | --- | --- | --- | --- |
   | Mechanical | `haiku` | `low` | Typo, copy or link fix, TODO row removal, one-file config or version bump with no design choice. |
   | Standard | `sonnet` | `medium` | A feature, fix or doc change within one app or lib that follows an existing pattern. |
   | Complex | `opus` | `high` | Spans several apps or libs, changes shared libs, infrastructure, auth, CI or migrations, needs a new pattern, or a bug whose cause is unknown. |

   Codex keeps its CLI default model unless the user names one; effort applies only where the dispatcher can set it. Agent flags (e.g. `agent=codex`) are added only when the user asks.

7. **Dispatch:** directly when no questions were asked; otherwise show the final prompt with the answers and chosen model and dispatch on the user's confirmation.

**Update variant** (`*-update-pr-*`): the target is an existing PR (number or URL; else the current branch's via `gh pr view`, else the conversation's most recent PR; ask if ambiguous). Research also reads the PR, its files, checks, mergeability and open review comments. Do not dispatch when the PR is closed or merged, or the request is unrelated to the PR's purpose, since existing PRs keep their purpose; suggest `gh-create-pr` for a follow-up. The written text is an instruction, not a prompt: the hosted agent sees the repo and the PR, so it may cite PR file lines. Number several review items in priority order. For the model step, judge the instruction plus the PR's diff: `resolve-conflicts` is Standard unless conflicting hunks change behavior on both sides, and `fix-ci` is Mechanical for lint, format or lockfile failures and Complex when the logs do not point to a cause.

## Entry-point parity

Each [README lifecycle row](../README.md#agentic) represents one operation across its supported Actions, Docker Sandbox and Local entry points. The table's Phase, Description and Actions columns also generate the `mobile-manager-next` Agentic tab, so edit them in the [documented format](../README.md#agentic).

### Task contract

Entry points must agree on canonical instructions, request/file scope, TODO handling, required checks and reported results. Workflows, wrappers and runner prompts must not redefine task policy. Runners may enforce the skill's file/ID limits.

**One PR per run:** every create or update run produces exactly one pull request; nothing splits or stacks automatically. A task too large for one PR is a no-change decision whose reason says so; a human or a `TODO.md` row re-scopes it (ordered increments in a row are dispatched one run each). `agentic-pr-update` keeps its PR's purpose: unrelated work is a separate `agentic-pr-create` run.

**TODO references:** resolve matching 6-hex IDs in free text against `TODO.md` using [todo-pattern.md](./todo-pattern.md), including Description and Recommended Fix. Report unknown IDs. Remove only fully resolved rows; partial/context-only references remain. Sandbox agents leave TODO edits to the runner and declare resolved `todo_ids`. `agentic-pr-update` accepts a TODO-only update (a stale row, or one never checked off) when the instruction names the ID; `agentic-pr-create` still requires real changes beyond `TODO.md`, except for a prompt of the exact form `Remove TODO.md row <id>. Reason: <reason>` (the dev-dashboard TODO view's Delete), which opens a PR removing only that row.

**No-change decisions:** when the request should not change anything (already done, out of scope, too large for one PR, or wrong for the repo), the agent makes no edits and says why. A sandbox agent writes `no_changes_reason` in its metadata; the runner prints `RESULT::no-changes` and a JSON-encoded `NO_CHANGES_REASON::` line ([no-changes.sh](../infrastructure/agent-sandbox/no-changes.sh)) and exits 0, so the run reports _Completed with no changes_ with the reason. No changes and no reason still fails, so a crashed agent is never reported as a decision. Audits and prune keep their `*_CLEAN` markers and add the reason when given; `agentic-pr-update` also comments it on the PR. Local sessions report the reason.

**UI-changing PRs:** Screenshots are required only when the changed page or component is reachable and renderable without authentication. If authentication or unavailable dependencies (a missing backend or secrets, or port conflicts) prevent exercising it in a browser, do not attempt or retry screenshots and do not mention missing screenshots as a PR concern or in `PR_CONCERNS`. For eligible pages, run `pnpm screenshot:themes -- <url>...` against the local dev server for each changed page ([manual verification](./app-development/ui/ui-app-pattern.md#manual-verification)) and preserve the captured PNGs with `python3 infrastructure/agent-sandbox/pr-screenshots.py --prepare <repo-relative paths...>` before committing. Include only captures from the current task. For eligible pages, when screenshot tooling cannot run (e.g. Chromium unavailable: `npx playwright install chromium`), state why in Concerns.

After committing, run the helper with the same paths without `--prepare` and pass its output as `PR_SCREENSHOTS` to `merge-pr-body.py` to display the images in the PR body. The `## Screenshots` section wraps images in `<details><summary>Screenshots</summary>` with blank lines around the images, as the last section, after Concerns, Suggestions and `## Agentic Change History`, followed only by the footer. Existing screenshot sections are moved and wrapped on the next merge, including when `PR_SCREENSHOTS` is unset. Sandbox agents instead list those paths in the `pr_screenshots` metadata array; runners handle preservation and embedding. Images are committed under `.github/pr-screenshots/` using content hashes and linked with commit-pinned relative GitHub URLs, so they survive VM cleanup and branch deletion. Review captures before publishing because the images become repository content.

Checks include the task's existing validation, the cleanup checklist when required by the skill, and pre-commit. PR results follow [Git conventions](./git-workflow.md#conventions) and emit `PR_URL::`; reports include changes, verification, assumptions and remaining work.

### Execution adapters

| Concern | Owner |
| --- | --- |
| Checkout and credentials | Hosted/sandbox runners prepare isolated checkouts, tokens, secrets and egress; local skills prepare the user's checkout. |
| Hosted summaries and email | Actions; local sandbox wrappers also write summaries when `GITHUB_STEP_SUMMARY` is set. |
| Provider/model selection | Workflow inputs and runner flags; local skills use the active agent without changing task policy. |
| Publishing | Runners publish unattended; local sessions require explicit authorization. |
| Scheduling | `cron-` entry points select schedule/defaults without changing the task. |

### Intentional differences

| Operation | Difference |
| --- | --- |
| `agentic-pr-create` | Actions accepts free text; the `gh-create-pr` skill dispatches the Actions run from a local session after research and blocking questions; local/sandbox positional IDs start separate runs per ID. Runnable entry points support `--agent codex`; locally it runs in the running dev sandbox with its signed-in Codex. Workstation solves also support `--agent ollama` (`--local`), with self hosted inference, retained preview checkouts by default and explicit `--publish`; see the [local adapter](../infrastructure/agent-sandbox/README.md#local-ollama-agent). `--vm` runs Claude (default) or `--agent codex` solves in the code-server container instead of Docker, without the egress firewall; see [the VM adapter](../infrastructure/agent-sandbox/README.md#running-on-the-code-server-vm). |
| `agentic-pr-create-audit` | Weekly/manual Actions plus Docker/Local; Claude, Opus by default. Runner caps 15 files and enforces Markdown/excluded-record scope. A clean audit opens no PR. |
| `agentic-pr-create-comment-audit` | Weekly/manual Actions plus Docker/Local; Claude. Comment-only edits; skill targets about 20 files, runner caps 30 and protects TODO/migrations/state. A clean audit opens no PR. |
| `agentic-pr-create-context-audit` | Weekly/manual Actions plus Docker/Local; Claude, Opus by default. Runner caps 15 files and guards context scope, skill frontmatter and adapters. A clean audit opens no PR. |
| `agentic-pr-create-free-tier-audit` | Weekly/manual Actions plus Docker/Local; Claude. Runner caps 10 files, edits Markdown only and protects TODO. A clean audit opens no PR. |
| `agentic-pr-create-inventory-audit` | Weekly/manual Actions plus Docker/Local; Claude. Candidates come from `scripts/ci/inventory-drift.sh`; skill edits at most 10 rows, runner allows only the two inventory docs. A clean audit opens no PR. |
| `agentic-pr-create-prune` | Weekly/manual Actions plus Docker/Local; Claude. Skill targets about 40 files, runner caps 50 and protects TODO/migrations/state. A clean sweep opens no PR. |
| `agentic-pr-create-readmes` | Weekly/manual Actions plus Docker/Local; Claude. Runs the `update-readmes` skill and `pnpm repo-stats`; runner caps 20 files and allows only READMEs and repo-stats copies. A clean run opens no PR. |
| `agentic-pr-create-smoke` | Actions-only dispatch check, with no separate local task. |
| `agentic-pr-create-url-audit` | Weekly/manual Actions plus Docker/Local; Claude. Runner caps 15 files and protects TODO/migrations/state. A clean audit opens no PR. |
| `agentic-pr-create-todo` | Manual Actions plus Docker/Local; Claude. The `gh-create-todo` skill dispatches the Actions run from a local session, condensing the conversation into a self-contained description. Large tasks become ordered increments in a row or independent rows, each dispatched as its own run. |
| `agentic-pr-create-todo-audit` | Weekly/manual Actions plus Docker/Local; Claude. Only TODO changes; new IDs or undeclared vanished IDs fail. |
| `agentic-pr-update` | Actions selector `change`; Claude by default. `--vm [--agent codex] [--codex-model <m>] [--codex-signed-in]` uses the shared VM SSH/token/session adapter and updates the existing PR branch; `remote-update-pr-codex` researches locally and dispatches without waiting. Codex options require `--vm --agent codex`. `--operation` takes `change` (default), `fix-ci` or `resolve-conflicts`; `--with-ci-logs` (Actions input `with_ci_logs`); Update runs always mark a still-draft PR ready after pushing, without waiting for checks (no-change runs do not). A failed run publishes nothing. The `gh-update-pr` skill dispatches the Actions run from a local session after research and blocking questions. |
| `agentic-pr-update-fix-ci` | `agentic-pr-update --operation fix-ci` and Actions selector `fix-ci`; runners supply failed logs; local sessions collect them. |
| `agentic-pr-update-resolve-conflicts` | `agentic-pr-update --operation resolve-conflicts` and Actions selector `resolve-conflicts`; accepts no instruction. Runners start the merge; local sessions start it themselves. The daily `cron-agentic-pr-update` only selects and dispatches the `resolve-conflicts` or `fix-ci` Actions selector for open PRs ([policy](./ci/agentic-pr-maintenance.md)); it adds no separate task, skill or local entry point. |

### Maintenance rule

When behavior changes, inspect every supported entry point: skill, pnpm script/wrapper, workflow inputs/forwarding, runner prompt/guards, result/summary consumers and README/cheatsheet rows. Rename adapters and installed links together. Do not invent an entry point to fill a table cell; unavailable ones stay `N/A`.

Verify argument forwarding and canonical skill loading end to end, using stubbed commands or temporary repositories where needed. Do not dispatch workflows or open disposable PRs as routine checks.

## Adding a context source or skill

Add adapters once alongside a new source; clones/worktrees need no regeneration:

```bash
ln -s CONTEXT.md <dir>/AGENTS.md
ln -s ../../agent-skills/<name>/SKILL.md setup/dotfiles/.claude/commands/<name>.md
```

`ci-pr-check` verifies tracked symlinks and exact targets. Move/delete adapters with their source. Tools that replace symlinks with regular files cause Git typechanges and fail this check. New harnesses need an adapter and a CI-check update. Windows without symlink support is unsupported; the repo targets macOS/Linux.

Format canonical sources, not adapters ([why](../projects/nx-workspace/CONTEXT.md#nx-formatting-must-not-hand-the-agent-symlinks-to-prettier)). The context site at `context.harryliu.dev` snapshots canonical sources only; a new directory `CONTEXT.md` is picked up automatically by the `snapshot.config.json` `{ "path": ".", "filename": "CONTEXT.md" }` source, so it needs no config edit. When a new kind of agent-context file appears (a new place `CONTEXT.md` points at, a new skills/commands directory), add it to the `context-md` app's `snapshot.config.json` `sources`, to the matching `paths` in `.github/workflows/deploy-context-md.yml` and to the `AGENT_CONTEXT_CHANGED` patterns in `.github/workflows/deploy-preview.yml` so the site picks it up and redeploys on change. Directory `CONTEXT.md` files are already covered.

## Installing skills

Both platform installers use `bash setup/common/agent-skills.sh` from the repo root. An optional destination home supports isolated checks. Setup adds skill links under `.agents/skills` and `.claude/skills`, and command links under `.claude/commands`; it preserves matching links and legacy caches, reports conflicting entries without replacing them, and exits nonzero on conflicts.

`bash setup/common/agent-skills-smoketest.sh` checks fresh/repeated installs, legacy caches, conflicts and command compatibility. Installed commands route through committed adapters. Restart the agent session if newly installed skills are not visible; setup does not manage credentials, plugins or personal settings. `ship-pr` requires explicit invocation and disables Codex implicit invocation in its metadata.

## Context discovery

Agents read `AGENTS.md`, which resolves to adjacent context; Claude Code reads it directly from v2.1.277, so no `CLAUDE.md` adapter is kept. Codex's startup chain follows the session's starting path; before deeper edits, read applicable directory context as root instructions require. Keep inherited context within the default 32 KiB limit. Sandbox `codex exec` uses `project_doc_max_bytes=65536` and, in Actions, a throwaway `CODEX_HOME` (local solves use the dev sandbox's signed-in one); machine setup leaves personal configuration alone.

## Documentation placement

Keep instructions in their narrowest owner:

- Domain rules belong in existing UI/API/CI/infrastructure pattern docs already linked from root.
- Component constraints belong in the deepest applicable `CONTEXT.md`, following [nuance-pattern.md](./nuance-pattern.md).
- Root contains repository-wide rules and necessary navigation only.

Do not duplicate a rule already discoverable through a required reading link. Placement guidance does not create an approval step or override explicit user instructions.

Standalone or leaf app/service Markdown and context describe the component's interface, direct dependencies, configuration, operational constraints and recovery. Caller-specific behavior belongs in the caller's docs; gateway routing and cross-app integration choreography belong in existing shared architecture/operations docs at the narrowest common owner.

Establish ownership from current source before relocating a passage:

- Identify the component's role from its entry point, routes or exported interface, package/project targets and deployment configuration. A standalone service or terminal capability can be a leaf even when many apps call it; directory names or lack of imports alone do not prove the role.
- Trace direction through runtime calls, imports, environment reads and configuration on both sides. A dependency is something the component needs or invokes; a consumer invokes the component. Build/deploy dependencies alone do not prove a runtime dependency. Record defining `file:line` evidence for the role, relationship and destination owner; search the repo, including hidden configuration, for competing ownership.
- Keep genuine direct dependencies and interoperability contracts needed to operate the leaf, including purposeful links. Required upstream API credentials, protocol/version constraints and recovery ordering belong with the service. Its request/response/auth contract can stay caller-neutral. A caller's endpoint mapping, gateway rewrite or rollout sequence belongs with the caller or shared operations owner. Hypothetically, `llm-service` need not explain `vb-express` consumer wiring; this example is not evidence of a current defect.
- Preserve every live constraint, workaround, ordered recovery step and diagnostic string at the destination before removing the original. Keep a useful link where readers need it; agent guidance must remain reachable through required reading. Repair incoming links/anchors and ToCs. Do not delete mentions merely to reduce app names or generalize away a required interoperability contract.

Audits apply this rule only within their own file scope and cap, including destinations and link repairs. If ownership is ambiguous, the destination is excluded or absent, or the complete move exceeds the cap, retain the passage and report the candidate, source evidence, proposed owner and blocking reason. Reading source for evidence does not authorize editing it.
