# Agent Support

Repository context and workflows shared by Claude Code, Codex, and future agents.

## Table of Contents

- [Sources and adapters](#sources-and-adapters)
- [Maintaining repository links](#maintaining-repository-links)
- [Installing skills](#installing-skills)
- [Context discovery](#context-discovery)

## Sources and adapters

| Source                                        | Adapter                                                        |
| --------------------------------------------- | -------------------------------------------------------------- |
| Root and directory-scoped `CONTEXT.md`        | Adjacent `AGENTS.md` and `CLAUDE.md` symlinks                  |
| `setup/dotfiles/agent-skills/<name>/SKILL.md` | Claude command aliases in `setup/dotfiles/.claude/commands/`   |
| Shared skill directories                      | Installed links in `~/.agents/skills/` and `~/.claude/skills/` |

Only the neutral context and skill sources are tracked. `AGENTS.md`, `CLAUDE.md`, and Claude command aliases are generated, Git-ignored relative symlinks; they contain no duplicate Markdown. Agent-specific settings stay in their own files, such as `.codex/config.toml` and a skill's `agents/openai.yaml`.

Skills reference [CONTEXT.md](../CONTEXT.md) and the documents in its Doc Map rather than copying conventions. Change the owning document first when a workflow and its conventions disagree. Repo-specific skills operate on the current vigilant-broccoli checkout; a global installation does not authorize operating on the installation checkout from another project.

## Maintaining repository links

After cloning, creating a worktree, switching branches, or adding a context source or skill, run:

```bash
bash setup/common/sync-agent-support.sh
bash setup/common/sync-agent-support.sh --check
```

The script discovers tracked and unignored new `CONTEXT.md` files and shared skills. It creates missing links, repairs incorrect symlink targets, and preserves conflicting regular files and directories with an error. It reports orphaned adapters instead of deleting them. Use `--clean` before moving or deleting sources or switching branches, then regenerate afterward. Cleanup removes only symlinks with the targets owned by this script; it preserves regular files and unrelated symlinks. `--check` reports drift without changing files and runs in PR CI.

Commit only the sources. Run setup before starting an agent in a fresh checkout: both machine installers and the standalone agent setup generate the links. PR CI generates and checks them, including that Git tracks no adapters and the checkout stays clean. Sandbox startup cleans old generated links before pulling and runs the Linux installer to regenerate them. PR fix/update runners also clean before checkout and regenerate for the target branch; new interactive sandbox sessions regenerate before launching the agent. The context viewer snapshots only the canonical context and shared skills, so each document appears once. Its existing `/claude-context` URL remains available.

## Installing skills

Both platform installers call the shared agent setup. To generate context adapters and install agent skills from the repository root:

```bash
bash setup/common/agent-skills.sh
```

An optional destination home directory lets you check installation in isolation. Setup creates per-skill links in `~/.agents/skills/` and `~/.claude/skills/`, plus command links in `~/.claude/commands/`. Matching entries are left alone; conflicting files, directories, and dangling symlinks are reported and preserved, with a nonzero exit status. Existing directory symlinks and caches from older installations continue to work.

Installed Claude commands point through the generated `.claude/commands/` paths used by the sandbox runners. Run `bash setup/common/agent-skills-smoketest.sh` to check fresh installs, repeated setup, legacy caches, conflicts, and command compatibility; machine-setup CI runs it too.

Use `/audit-note <scope>` in Claude or `$audit-note <scope>` in Codex. `ship-pr` requires explicit invocation; its Codex metadata disables implicit invocation. Start a new session after installation if skills are not visible. Executables, credentials, permissions, plugins, and personal settings are managed separately.

## Context discovery

Each agent reads its conventional filename, which resolves to the adjacent `CONTEXT.md`. Keep directory context beside the code it governs so relative documentation links and scoping remain intact.

Codex builds its startup instruction chain from the repository root through the session's starting directory. The root instructions also require reading applicable context before editing a deeper subtree. `.codex/config.toml` raises the combined instruction limit to 64 KiB for the trusted project; the root context exceeds the default 32 KiB. Keep inherited context within that limit.
