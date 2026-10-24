# Agent Support

Shared context, skills and execution contracts for repository agents.

## Table of Contents

- [Sources and adapters](#sources-and-adapters)
- [Agentic commands](#agentic-commands)
- [Entry-point parity](#entry-point-parity)
  - [Task contract](#task-contract)
  - [Execution adapters](#execution-adapters)
  - [Intentional differences](#intentional-differences)
  - [Maintenance rule](#maintenance-rule)
- [Pull request scope](#pull-request-scope)
  - [Increment contract](#increment-contract)
- [Adding a context source or skill](#adding-a-context-source-or-skill)
- [Installing skills](#installing-skills)
- [Context discovery](#context-discovery)
- [Documentation placement](#documentation-placement)

## Sources and adapters

| Source                                        | Adapter                                                            |
| --------------------------------------------- | ------------------------------------------------------------------ |
| Root and directory `CONTEXT.md`               | Adjacent `AGENTS.md` relative symlink                              |
| `setup/dotfiles/agent-skills/<name>/SKILL.md` | Relative command symlinks under `setup/dotfiles/.claude/commands/` |
| Shared skill directories                      | Installed links in `~/.agents/skills/` and `~/.claude/skills/`     |

Edit canonical sources, not adapters. Skills reference owning docs rather than copying conventions. Personal Codex configuration remains outside the repo; skill UI metadata lives in `agents/openai.yaml`. A globally installed repo skill operates on the current vigilant-broccoli checkout, never its installation checkout by default.

## Agentic commands

Operations use `agentic-<resource>-<verb>[-<variant>]` for the root pnpm script and skill. Claude invokes `/name`; Codex invokes `$name`. Actions adds `manual-`/`cron-` or routes related operations through a selector: `manual-agentic-pr-update` selects `change`, `fix-ci` or `resolve-conflicts`.

Task policy belongs in the canonical `SKILL.md`. Runners load it before PR checkout (older branches may lack it) and embed it in prompts. Runners own checkout setup, credentials, merge preparation, metadata, validation and publishing; skills state preparation needed only in local sessions. Local invocation alone does not authorize publishing. Agentic workflows use the [shared run summary](./ci/workflow-conventions.md#agentic-run-summaries).

Maintenance scopes differ: prune removes verified dead code/docs, audit rewrites obsolete implementation documentation and corrects claims the tree no longer backs, context audit slims duplicated agent guidance without losing facts, TODO audit changes only backlog rows, and [refactor cleanup](./refactor-code-cleanup.md) reviews only the current diff. Smoke is Actions-only.

## Entry-point parity

Each [README lifecycle row](../README.md#agentic) represents one operation across its supported Actions, Docker Sandbox and Local entry points. The table's Phase, Description and Actions columns also generate the `vb-manager-next-mobile` Agentic tab, so edit them in the [documented format](../README.md#agentic).

### Task contract

Entry points must agree on canonical instructions, request/file scope, TODO handling, increment rules, required checks and reported results. Workflows, wrappers and runner prompts must not redefine task policy. Runners may enforce the skill's file/ID limits.

**No-change decisions:** when the request should not change anything (already done, out of scope, or wrong for the repo), the agent makes no edits and says why. A sandbox agent writes `no_changes_reason` in its metadata; the runner prints `RESULT::no-changes` and a JSON-encoded `NO_CHANGES_REASON::` line ([no-changes.sh](../infrastructure/agent-sandbox/no-changes.sh)) and exits 0, so the run reports _Completed with no changes_ with the reason. No changes and no reason still fails, so a crashed agent is never reported as a decision. Audits and prune keep their `*_CLEAN` markers and add the reason when given; `agentic-pr-update` also comments it on the PR. Local sessions report the reason.

Checks include the task's existing validation, the cleanup checklist when required by the skill, and pre-commit. PR results follow [Git conventions](./git-workflow.md#conventions) and emit `PR_URL::`; reports include changes, verification, assumptions and remaining work.

### Execution adapters

| Concern                    | Owner                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Checkout and credentials   | Hosted/sandbox runners prepare isolated checkouts, tokens, secrets and egress; local skills prepare the user's checkout. |
| Hosted summaries and email | Actions; local sandbox wrappers also write summaries when `GITHUB_STEP_SUMMARY` is set.                                  |
| Provider/model selection   | Workflow inputs and runner flags; local skills use the active agent without changing task policy.                        |
| Publishing                 | Runners publish unattended; local sessions require explicit authorization.                                               |
| Scheduling                 | `cron-` entry points select schedule/defaults without changing the task.                                                 |

### Intentional differences

| Operation                             | Difference                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agentic-pr-create`                   | Actions accepts free text; local/sandbox positional IDs start separate runs per ID. Runnable entry points support `--agent codex`; locally it runs in the running dev sandbox with its signed-in Codex. Workstation solves also support `--agent ollama` (`--local`), with self hosted inference, retained preview checkouts by default and explicit `--publish`; see the [local adapter](../infrastructure/agent-sandbox/README.md#local-ollama-agent). `--vm` runs Claude solves in the code-server container instead of Docker, without the egress firewall; see [the VM adapter](../infrastructure/agent-sandbox/README.md#running-on-the-code-server-vm). |
| `agentic-pr-create-audit`             | Weekly/manual Actions plus Docker/Local; Claude, Opus by default. Runner caps 15 files and enforces Markdown/excluded-record scope. A clean audit opens no PR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `agentic-pr-create-context-audit`     | Weekly/manual Actions plus Docker/Local; Claude, Opus by default. Runner caps 15 files and guards context scope, skill frontmatter and adapters. A clean audit opens no PR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `agentic-pr-create-prune`             | Weekly/manual Actions plus Docker/Local; Claude. Skill targets about 40 files, runner caps 50 and protects TODO/migrations/state. A clean sweep opens no PR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `agentic-pr-create-rnd`               | Claude; writes proposed increments into the note rather than publishing them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `agentic-pr-create-smoke`             | Actions-only dispatch check, with no separate local task.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `agentic-pr-create-todo`              | Docker/Local only, Claude. Large tasks become ordered increments in a row or independent rows.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `agentic-pr-create-todo-audit`        | Weekly/manual Actions plus Docker/Local; Claude. Only TODO changes; new IDs or undeclared vanished IDs fail.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `agentic-pr-update`                   | Actions selector `change`; Claude. `--operation` takes `change` (default), `fix-ci` or `resolve-conflicts`; `--with-ci-logs` (Actions input `with_ci_logs`). Follow-ups may split; failure recovery uses a separate draft targeting the original PR, retaining unresolved TODOs and hooks.                                                                                                                                                                                                                                                                                                                                                                     |
| `agentic-pr-update-fix-ci`            | `agentic-pr-update --operation fix-ci` and Actions selector `fix-ci`; never splits. Runners supply failed logs; local sessions collect them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `agentic-pr-update-resolve-conflicts` | `agentic-pr-update --operation resolve-conflicts` and Actions selector `resolve-conflicts`; never splits, accepts no instruction. Runners start the merge; local sessions start it themselves.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Maintenance rule

When behavior changes, inspect every supported entry point: skill, pnpm script/wrapper, workflow inputs/forwarding, runner prompt/guards, result/summary consumers and README/cheatsheet rows. Rename adapters and installed links together. Do not invent an entry point to fill a table cell; unavailable ones stay `N/A`.

Verify argument forwarding and canonical skill loading end to end, using stubbed commands or temporary repositories where needed. Do not dispatch workflows or open disposable PRs as routine checks.

## Pull request scope

- **TODO references:** resolve matching 6-hex IDs in free text against `TODO.md` using [todo-pattern.md](./todo-pattern.md), including Description and Recommended Fix. Report unknown IDs. Remove only fully resolved rows; partial/context-only references remain. Sandbox agents leave TODO edits to the runner and declare resolved `todo_ids`. `agentic-pr-update` accepts a TODO-only update (a stale row, or one never checked off) when the instruction names the ID; `agentic-pr-create` still requires real changes beyond `TODO.md`.
- **One mergeable increment per PR:** keep simple tasks together. Split independent or oversized work by outcome, with each increment useful on its own. Sandbox agents implement the first and describe the rest in `increments`; local sessions list ready-to-run `pnpm agentic-pr-create --prompt "<task>"` follow-ups unless separately authorized to publish them.
- **Existing PRs keep their purpose:** unrelated work becomes a follow-up; stack it only when it needs the target PR's changes.

### Increment contract

`infrastructure/agent-sandbox/pr-increments.sh` implements create/update splitting. The first agent run may supply:

| Field                     | Meaning                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `increments[].depends_on` | Empty for independent work, `current` for this increment, or one earlier increment's ID. |
| `increments[].id`         | Unique kebab-case ID, never `current`.                                                   |
| `increments[].task`       | Self-contained prompt for a fresh agent seeing only the request and plan.                |
| `increments[].title`      | PR title.                                                                                |
| `increments[].todo_ids`   | Requested 6-hex TODO IDs this increment fully resolves.                                  |
| `todo_ids`                | IDs fully resolved by the current increment.                                             |

Before publishing, the runner validates at most four follow-ups, unique IDs, titles/tasks, one earlier prerequisite per increment, and TODO IDs present in both the request and backlog and unique across the plan.

Each follow-up gets a fresh agent. Independent branches start from and target `origin/main`; dependent branches start from and target their prerequisite. Each PR has its own title, summary, next steps, suggestions, history row and `## Stack` merge order. Publishing stops at the first failure: save partial work as a draft, report later increments unpublished and leave prior PRs intact. The runner owns Git/publishing and never force-pushes. Separately authorized local publishing follows the same contract. See [stack maintenance](./git-workflow.md#stacked-pull-requests) after squash merges.

## Adding a context source or skill

Add adapters once alongside a new source; clones/worktrees need no regeneration:

```bash
ln -s CONTEXT.md <dir>/AGENTS.md
ln -s ../../agent-skills/<name>/SKILL.md setup/dotfiles/.claude/commands/<name>.md
```

`ci-pr-check` verifies tracked symlinks and exact targets. Move/delete adapters with their source. Tools that replace symlinks with regular files cause Git typechanges and fail this check. New harnesses need an adapter and a CI-check update. Windows without symlink support is unsupported; the repo targets macOS/Linux.

Format canonical sources: Prettier rejects explicitly named symlinks before ignore filtering. `scripts/shell/format-staged.sh` filters them for root hooks; Nx's workspace ignore rules exclude its adapters. The context site at `context.harryliu.dev` snapshots canonical sources only. When a new kind of agent-context file appears (a new place `CONTEXT.md` points at, a new skills/commands directory), add it to the `context-md` app's `snapshot.config.json` `sources`, to the matching `paths` in `.github/workflows/deploy-context-md.yml` and to the `AGENT_CONTEXT_CHANGED` patterns in `.github/workflows/deploy-preview.yml` so the site picks it up and redeploys on change. Directory `CONTEXT.md` files are already covered.

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
