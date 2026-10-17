# Claude Adapters

Claude-specific entry points for the [shared agent support](../../../docs/agent-support.md).

## Table of Contents

- [Adapters](#adapters)
- [Installation](#installation)

## Adapters

- `commands/` contains committed relative symlinks to `../../agent-skills/<name>/SKILL.md`. Edit the shared skill sources; add or rename their command symlinks in the same change.
- `skills/` is legacy runtime storage for installations that link `~/.claude/skills` here. Synced caches, trash, and installed skill links are ignored by Git and preserved by setup.

## Installation

- Run `bash setup/common/agent-skills.sh` from the repository root to install the shared skills and Claude commands.
- Follow [agentic command conventions](../../../docs/agent-support.md#agentic-commands) for shared naming, runner instructions and rename cleanup.
- See [agent support](../../../docs/agent-support.md) for context discovery and the source layout.
