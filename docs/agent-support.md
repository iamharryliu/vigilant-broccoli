# Agent Support

Repository context and workflows shared by Claude Code, Codex, and future agents.

## Table of Contents

- [Sources and adapters](#sources-and-adapters)
- [Adding a context source or skill](#adding-a-context-source-or-skill)
- [Installing skills](#installing-skills)
- [Context discovery](#context-discovery)

## Sources and adapters

| Source                                        | Adapter                                                        |
| --------------------------------------------- | -------------------------------------------------------------- |
| Root and directory-scoped `CONTEXT.md`        | Adjacent `AGENTS.md` and `CLAUDE.md` symlinks                  |
| `setup/dotfiles/agent-skills/<name>/SKILL.md` | Claude command aliases in `setup/dotfiles/.claude/commands/`   |
| Shared skill directories                      | Installed links in `~/.agents/skills/` and `~/.claude/skills/` |

`CONTEXT.md` and the shared `SKILL.md` files are the only sources. The adapters beside them are committed relative symlinks (Git mode `120000`, ten bytes, one blob shared by all of them), so they carry no duplicate Markdown and a clone is usable before any setup runs. Agent-specific settings stay in their own files, such as `setup/dotfiles/.codex/config.toml` and a skill's `agents/openai.yaml`.

Skills reference [CONTEXT.md](../CONTEXT.md) and the documents in its Doc Map rather than copying conventions. Change the owning document first when a workflow and its conventions disagree. Repo-specific skills operate on the current vigilant-broccoli checkout; a global installation does not authorize operating on the installation checkout from another project.

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

The context viewer snapshots only the canonical context and shared skills, so each document appears once. Its existing `/claude-context` URL remains available.

## Installing skills

Both platform installers call the shared agent setup. To install the agent skills from the repository root:

```bash
bash setup/common/agent-skills.sh
```

An optional destination home directory lets you check installation in isolation. Setup creates per-skill links in `~/.agents/skills/` and `~/.claude/skills/`, plus command links in `~/.claude/commands/`. Matching entries are left alone; conflicting files, directories, and dangling symlinks are reported and preserved, with a nonzero exit status. Existing directory symlinks and caches from older installations continue to work.

Installed Claude commands point through the committed `.claude/commands/` symlinks used by the sandbox runners. Run `bash setup/common/agent-skills-smoketest.sh` to check fresh installs, repeated setup, legacy caches, conflicts, and command compatibility; machine-setup CI runs it too.

Use `/audit-note <scope>` in Claude or `$audit-note <scope>` in Codex. `ship-pr` requires explicit invocation; its Codex metadata disables implicit invocation. Start a new session after installation if skills are not visible. Executables, credentials, permissions, plugins, and personal settings are managed separately.

## Context discovery

Each agent reads its conventional filename, which resolves to the adjacent `CONTEXT.md`. Keep directory context beside the code it governs so relative documentation links and scoping remain intact.

Codex builds its startup instruction chain from the repository root through the session's starting directory. The root instructions also require reading applicable context before editing a deeper subtree. The root context exceeds Codex's default 32 KiB instruction limit, and Codex truncates past it without warning, so the limit is raised to 64 KiB in two places — neither is optional:

- Locally, `setup/dotfiles/.codex/config.toml` carries `project_doc_max_bytes` and setup symlinks it to `~/.codex/config.toml`. Codex reads configuration only from `$CODEX_HOME`, never from a repository-local `.codex/config.toml`, so a checked-in copy would be inert.
- In the sandbox, `solve-todo-runner.sh` passes `-c project_doc_max_bytes=65536` to `codex exec`, because that run uses a throwaway `$CODEX_HOME` with no configuration file.

Keep inherited context within that limit, and raise both together if the root context grows past it.
