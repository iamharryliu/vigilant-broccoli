# Agent Support

Repository context and workflows shared by Claude Code, Codex, and future agents.

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

| Source                                        | Adapter                                                        |
| --------------------------------------------- | -------------------------------------------------------------- |
| Root and directory-scoped `CONTEXT.md`        | Adjacent `AGENTS.md` and `CLAUDE.md` symlinks                  |
| `setup/dotfiles/agent-skills/<name>/SKILL.md` | Claude command aliases in `setup/dotfiles/.claude/commands/`   |
| Shared skill directories                      | Installed links in `~/.agents/skills/` and `~/.claude/skills/` |

`CONTEXT.md` and the shared `SKILL.md` files are the only sources. The adapters beside them are committed relative symlinks (Git mode `120000`, ten bytes, one blob shared by all of them), so they carry no duplicate Markdown and a clone is usable before any setup runs. Personal Codex settings stay in the untracked `~/.codex/config.toml`; skill metadata stays in each skill's `agents/openai.yaml`.

Skills reference [CONTEXT.md](../CONTEXT.md) and the documents in its Doc Map rather than copying conventions. Change the owning document first when a workflow and its conventions disagree. Repo-specific skills operate on the current vigilant-broccoli checkout; a global installation does not authorize operating on the installation checkout from another project.

## Agentic commands

Use one base name, `agentic-<resource>-<verb>[-<variant>]`, for each operation: for example `agentic-pr-create`, `agentic-pr-update`, or `agentic-pr-update-resolve-conflicts`. The root pnpm script and canonical skill directory/frontmatter use that exact name; Claude exposes `/name` and Codex `$name`. The corresponding GitHub workflow adds its routing prefix (`manual-` or `cron-`), or serves several related operations through an explicit selector. `manual-agentic-pr-update` routes `change`, `fix-ci`, and `resolve-conflicts` to their existing wrappers and skills; the local command names stay separate. Runner filenames are implementation details.

Keep task instructions in `setup/dotfiles/agent-skills/<name>/SKILL.md`. Both local sessions and sandbox prompts consume that source. Runners load the file at runtime and embed it in the prompt; load it before checking out a PR branch, which may predate the skill. Variant runners select the matching variant skill rather than copying its task instructions into shell strings or YAML.

Every agentic workflow reports its work through the shared run summary described in [agentic run summaries](./ci/workflow-conventions.md#agentic-run-summaries); host wrappers hand the log and exit status to `write-pr-step-summary.sh` for the result, and local runs without `GITHUB_STEP_SUMMARY` are unaffected.

Keep runtime concerns in the runner: isolated checkout setup, credentials, merge preparation, metadata, validation, commits, pushes and PR publishing. Skills describe the task and any local preparation needed when no runner has prepared the checkout. Mark those local steps explicitly so sandbox agents do not repeat them. A local skill invocation alone does not authorize publishing.

Plan, Develop and Maintain operations follow this pattern. The smoke workflow is an Actions-only pipeline check and has no local equivalent. The two cleanup-shaped Maintain operations differ by scope: `agentic-pr-create-todo-audit` only edits `TODO.md`, and `agentic-pr-create-prune` removes repo-wide dead code and stale docs but never `TODO.md`; neither replaces the diff-scoped [refactor-code-cleanup.md](./refactor-code-cleanup.md) checklist.

When adding or renaming an operation, update the root script, workflow name and concurrency routing where applicable, canonical skill and command adapter, runner references and history labels, README lifecycle table, command cheatsheet and installed skill links together. Do not add a workflow just to fill the Actions column: reuse an existing entry point when it serves the task, otherwise use `N/A`. Do not add a local equivalent to the table unless it exists. Verify argument forwarding, skill loading and adapters without publishing live PRs as a routine check.

## Entry-point parity

Each row of the README's [Agentic lifecycle table](../README.md#agentic) is one operation reached through up to three entry points: Actions (a workflow), Docker Sandbox (a `pnpm` script that runs a runner in the sandbox container) and Local (the skill, run in an interactive session). The entry points of one row are interchangeable ways to ask for the same thing, so they must behave the same on everything below and may differ only where [execution adapters](#execution-adapters) and [intentional differences](#intentional-differences) say so.

### Task contract

For an operation and equivalent task input, every supported entry point must match on:

- **Canonical instructions.** The task is defined by `setup/dotfiles/agent-skills/<name>/SKILL.md` and the docs it links; the sandbox runner embeds that file, a local session reads it. No entry point restates, narrows or widens task policy in a workflow, wrapper, runner prompt or command alias. Runner prompts add only execution rules and the metadata request.
- **Interpretation and scope.** The same request means the same outcome and the same permitted file scope: R&D writes only under `docs/rnd/`, TODO planning adds one row to `TODO.md` and nothing else, the audit edits only `TODO.md`, prune never edits `TODO.md`, fix-ci diagnoses the failing check logs, resolve-conflicts preserves both sides of the merge, and smoke is an Actions-only pipeline check.
- **TODO resolution.** Ids in the request resolve per [pull request scope](#pull-request-scope): the same rows are read, only rows an increment fully resolves are removed, and an id without a row is reported.
- **Increments.** Where split work is supported (`agentic-pr-create`, and the change operation of `agentic-pr-update`), all entry points use the same split criteria, independent-versus-stacked rules, per-PR content and failure handling of the [increment contract](#increment-contract). Other operations stay on one PR and never split.
- **Validation.** The same checks are expected before reporting success: the task's existing checks, `docs/refactor-code-cleanup.md` where the skill asks for it, and pre-commit. Runner-side guards (changed-file scope, TODO id preservation, file caps) enforce what the skill already states.
- **Reported outcome.** The same facts are reported: what changed, verification, assumptions, remaining work and, for PRs, the shared PR body (`## Summary`, `## Next steps`, `## Suggestions`, `## Agentic Change History` via `merge-pr-body.py`) and `PR_URL::` result marker.

### Execution adapters

Only these may differ by entry point:

| Concern                                  | Owner                                                                                                                                                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosted summaries and email               | Actions only: the shared run summary and, for `manual-agentic-pr-create`, the notification email. Docker Sandbox runs write the summary when `GITHUB_STEP_SUMMARY` is set; Local has neither.              |
| Isolated checkout and credentials        | Actions and Docker Sandbox: a fresh clone or PR checkout in the container, the minted GitHub App token, Vault secrets and the egress firewall. Local: the user's checkout, which the skill asks them to prepare. |
| Provider and model selection             | Workflow inputs and `--agent`/`--model` flags choose the model (and, for create, Codex). The task instructions are identical whichever model runs them.                                                     |
| Scheduling                               | `cron-` workflows add a schedule and default inputs; the task is the same one the `pnpm` script runs.                                                                                                       |
| Unattended authorization to publish      | Actions and Docker Sandbox runners own staging, commits, pushes, PR creation and PR metadata. A local skill describes any preparation it needs and gains no implicit permission to commit, push or open a PR. |

### Intentional differences

| Operation                               | Actions                                                       | Docker Sandbox                                                                     | Local                                    | Difference                                                                                                                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agentic-pr-create`                     | `manual-agentic-pr-create` (`prompt` only)                    | `<id...>` or `--prompt`                                                            | `<id...>` or `--prompt`                  | Actions takes the single free-text prompt, so ids are named inside it. `<id...>` is a local convenience that starts one independent run per id, each planned and published on its own; it is not one combined plan. `--agent codex` exists on both runnable entry points; Local uses whatever agent runs the skill. |
| `agentic-pr-create-prune`               | `cron-agentic-pr-create-prune` (weekly or manual)             | `pnpm agentic-pr-create-prune`                                                     | `/agentic-pr-create-prune`               | Claude only. The runner rejects a diff over 50 files, and `TODO.md`, migrations or Terraform state changes; the skill asks for about 40 files. A clean sweep opens no PR.                                                                         |
| `agentic-pr-create-rnd`                 | `manual-agentic-pr-create-rnd`                                | `pnpm agentic-pr-create-rnd`                                                       | `/agentic-pr-create-rnd`                 | Claude only. The note's increments are written into the note for later `agentic-pr-create` runs rather than published as PRs.                                                                                                                      |
| `agentic-pr-create-smoke`               | `manual-agentic-pr-create-smoke`                              | N/A                                                                                | N/A                                      | Actions-only pipeline check that dispatches `manual-agentic-pr-create` with a canned prompt. It has no task of its own to keep in parity.                                                                                                        |
| `agentic-pr-create-todo`                | N/A                                                           | `pnpm agentic-pr-create-todo`                                                      | `/agentic-pr-create-todo`                | No workflow; none is added for symmetry. Claude only. Large tasks become ordered increments inside the row, or several rows, rather than several PRs.                                                                                            |
| `agentic-pr-create-todo-audit`          | `cron-agentic-pr-create-todo-audit` (weekly or manual)        | `pnpm agentic-pr-create-todo-audit`                                                | `/agentic-pr-create-todo-audit`          | Claude only. The runner rejects any file besides `TODO.md`, vanished ids not reported as resolved, and new ids. A clean audit opens no PR.                                                                                                        |
| `agentic-pr-update`                     | `manual-agentic-pr-update` (`operation=change`)               | `pnpm agentic-pr-update <pr> "<instruction>"`                                      | `/agentic-pr-update <pr> <instruction>`  | Claude only. Splitting creates follow-up PRs and leaves the target PR on its purpose. Unlike create, the update runner has no draft-PR salvage of a failed agent run; the target PR stays as it was. `--with-ci-logs` is a Docker Sandbox flag.    |
| `agentic-pr-update-fix-ci`              | `manual-agentic-pr-update` (`operation=fix-ci`)               | `pnpm agentic-pr-update-fix-ci <pr> ["<instruction>"]`                             | `/agentic-pr-update-fix-ci <pr>`         | Never splits. The runner collects the failing logs the agent cannot fetch with `gh`; a local session collects them itself.                                                                                                                        |
| `agentic-pr-update-resolve-conflicts`   | `manual-agentic-pr-update` (`operation=resolve-conflicts`)    | `pnpm agentic-pr-update-resolve-conflicts <pr>`                                    | `/agentic-pr-update-resolve-conflicts <pr>` | Never splits and takes no instruction. The runner starts the `origin/main` merge; a local session starts it itself.                                                                                                                              |

### Maintenance rule

When you change an operation's behavior, inspect and update every supported entry point in its lifecycle row in the same change: the skill, the root `pnpm` script and wrapper, the workflow inputs and their forwarding, the runner prompt and guards, the result markers and summary consumers, and the README, cheatsheet and sandbox README rows. Put task policy in the skill or the docs it links and execution policy in the runner. Before claiming parity, verify it: read the argument path of each entry point end to end, confirm each loads the canonical skill and none overrides its policy, and exercise argument forwarding with stubbed `docker`, `gh` and agent commands or a temporary local repository. Do not dispatch workflows or open disposable PRs as a routine check, and do not add a workflow or local command just to fill a cell: an entry point that does not exist stays `N/A`.

## Pull request scope

Agentic operations that open or extend a pull request share these scope rules, so every PR they produce can be reviewed and merged on its own:

- **TODO ids in free text.** A request may name `TODO.md` ids in passing ("solve a1b2c3 and d4e5f6"). Treat each 6-hex token that matches a row's leading cell as a reference to that row: read its Description and Recommended Fix as part of the task per [todo-pattern.md](./todo-pattern.md) and report an id with no row rather than guessing. In a sandbox the agent never edits `TODO.md`; it lists in `todo_ids` the ids its increment **fully** resolves and the runner removes exactly those rows from that increment's branch. An id mentioned only for context, or resolved partly, stays. A row that vanishes without being declared fails the run.
- **One mergeable increment per PR.** Each PR should leave `main` working and be worth merging even if nothing after it lands. Keep a simple task as one PR; prefer the smallest increment that delivers the requested outcome over one large change.
- **Split when the request does not fit.** When a request bundles independent changes (unrelated TODO ids, separate apps, a refactor plus a feature) or is too large to review as one diff, split it by outcome, not by file path: one file may change in several increments. In a sandbox the agent implements the first increment and describes the rest in the metadata `increments` array; the runner validates the whole plan, then publishes every increment (see [increment contract](#increment-contract)). In a local session without a sandbox, implement the first increment and list the rest as ready-to-run `pnpm agentic-pr-create --prompt "<task>"` follow-ups.
- **Never grow an existing PR sideways.** An update applies what belongs to the PR's purpose; independent work it surfaces becomes a separate follow-up increment PR (stacked on the target PR only when it needs that PR's changes) instead of more diff.

### Increment contract

`infrastructure/agent-sandbox/pr-increments.sh`, sourced by `solve-todo-runner.sh` and `update-pr-runner.sh`, is the single implementation behind `pnpm agentic-pr-create`, `manual-agentic-pr-create` and the change operation of `pnpm agentic-pr-update`/`manual-agentic-pr-update`. The first agent run implements the first increment and may add to its metadata file:

| Field                     | Meaning                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `increments[].depends_on` | `""` for an increment that works on `main` alone, `"current"` for one that needs the increment being implemented now, or the id of one earlier-listed increment |
| `increments[].id`         | Short unique kebab-case id, never `current`                                                                                                                     |
| `increments[].task`       | Self-contained prompt for a fresh agent that sees only the original request and the plan                                                                        |
| `increments[].title`      | Pull request title                                                                                                                                              |
| `increments[].todo_ids`   | 6-hex ids named in the request that this increment fully resolves                                                                                               |
| `todo_ids`                | Ids the increment being implemented now fully resolves                                                                                                          |

The runner rejects the run, before publishing anything, when the plan is not an array of at most 4 increments with unique ids, titles, tasks, a single earlier prerequisite, and `todo_ids` that are unique across the plan, have a row in `TODO.md` and are named in the request. Then it runs one fresh agent per later increment: an independent one branches from `origin/main` and targets `main`; a dependent one branches from its prerequisite's branch and targets that branch, so its PR diff is only its own increment. Each increment gets its own title, summary, next steps, suggestions, `## Agentic Change History` row and a `## Stack` section listing every PR in merge order. Publishing stops at the first failing increment: its partial work becomes a draft PR, the rest are reported as unpublished with their reason, and PRs already opened stay. Git, pushes and PR creation never leave the runner. Branches are only ever created and pushed, never force-pushed.

Stacked PRs and squash merges: see [Stacked pull requests](./git-workflow.md#stacked-pull-requests).

## Adding a context source or skill

Clones, worktrees, branch switches, the sandbox container and CI all get the adapters from Git, so nothing has to be generated or refreshed. Only a new source needs its adapters created, once, in the same commit:

```bash
# new directory context
ln -s CONTEXT.md <dir>/CLAUDE.md && ln -s CONTEXT.md <dir>/AGENTS.md
# new shared skill
ln -s ../../agent-skills/<name>/SKILL.md setup/dotfiles/.claude/commands/<name>.md
git add <dir>/CLAUDE.md <dir>/AGENTS.md
```

The `pre-commit` job in `ci-pr-check.yml` fails when a `CONTEXT.md` is missing either adapter, when an adapter is a regular file rather than mode `120000`, or when one points somewhere other than its own directory's `CONTEXT.md`.

Two constraints follow from the adapters being tracked symlinks:

- Prettier exits non-zero on an explicitly passed symbolic link and `.prettierignore` does not suppress it, so `format:commit` routes `lint-staged`'s file list through `scripts/shell/format-staged.sh`, which drops symlinks. Nx reads its own workspace's ignore rules, so `projects/nx-workspace/.gitignore` keeps `AGENTS.md`/`CLAUDE.md` listed to keep `nx format` from handing them to Prettier. Format the `CONTEXT.md` sources.
- A tool that saves by writing a temporary file and renaming it over the target replaces the symlink with a regular file. Git reports that as a typechange (`T` in `git status`), and the CI check above fails on it.

A Windows checkout without symlink support materializes each adapter as a text file containing the string `CONTEXT.md`; this repository targets macOS and Linux only.

The context viewer snapshots only the canonical context and shared skills, so each document appears once. It is served at `context.harryliu.dev`.

## Installing skills

Both platform installers call the shared agent setup. To install the agent skills from the repository root:

```bash
bash setup/common/agent-skills.sh
```

An optional destination home directory lets you check installation in isolation. Setup creates per-skill links in `~/.agents/skills/` and `~/.claude/skills/`, plus command links in `~/.claude/commands/`. Matching entries are left alone; conflicting files, directories, and dangling symlinks are reported and preserved, with a nonzero exit status. Existing directory symlinks and caches from older installations continue to work.

Installed Claude commands point through the committed `.claude/commands/` symlinks used by the sandbox runners. Run `bash setup/common/agent-skills-smoketest.sh` to check fresh installs, repeated setup, legacy caches, conflicts, and command compatibility; machine-setup CI runs it too.

Use `/agentic-pr-create-rnd <question>` in Claude or `$agentic-pr-create-rnd <question>` in Codex. `ship-pr` requires explicit invocation; its Codex metadata disables implicit invocation. Start a new session after installation if skills are not visible. Executables, credentials, permissions, plugins, and personal settings are managed separately.

## Context discovery

Each agent reads its conventional filename, which resolves to the adjacent `CONTEXT.md`. Keep directory context beside the code it governs so relative documentation links and scoping remain intact.

Codex builds its startup instruction chain from the repository root through the session's starting directory. The root instructions also require reading applicable context before editing a deeper subtree. Keep inherited context within Codex's default 32 KiB instruction limit; the root context fits within it. Machine setup does not create or modify personal Codex configuration.

The sandbox runner retains its explicit `-c project_doc_max_bytes=65536` flag for `codex exec`, which uses a throwaway `$CODEX_HOME`.

## Documentation placement

Keep the root [CONTEXT.md](../CONTEXT.md) slim. Put each new convention in the narrowest document that owns it:

- Domain conventions (UI, API, CI, infrastructure, tooling) go in the existing owning pattern document that the root already links as read-first, such as [ui-app-pattern.md](./app-development/ui/ui-app-pattern.md) for UI apps. Do not repeat them in the root when that link already makes them discoverable.
- Component conventions and non-obvious traps go in the `CONTEXT.md` of the deepest directory they affect; record traps as nuances per [nuance-pattern.md](./nuance-pattern.md).
- Root additions are for genuinely repository-wide instructions or a necessary new navigation link, not for every new UI, API or tooling pattern. For example, the system light/dark default lives in the UI pattern's theme section and has no root bullet.

This is a default for where to write, not an approval step: an explicit instruction from the user takes precedence, and authorized work is never blocked by it.
