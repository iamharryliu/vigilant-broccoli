# Claude Adapters

Claude-specific entry points for the [shared agent support](../../../docs/agent-support.md).

- `commands/` contains generated, Git-ignored relative symlinks to `../agent-skills/<name>/SKILL.md`. Edit the shared sources, then run `bash setup/common/sync-agent-support.sh` from the repository root.
- `skills/` is legacy runtime storage for installations that link `~/.claude/skills` here. Synced caches, trash, and installed skill links are ignored by Git and preserved by setup.

Installation, context discovery, and the source layout are documented in [agent-support.md](../../../docs/agent-support.md).
