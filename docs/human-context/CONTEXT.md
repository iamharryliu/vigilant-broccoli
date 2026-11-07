# Agent Context — docs/human-context/

Diagrams and overviews for people; agents never read them for rules.

## Table of Contents

- [Scope](#scope)
- [Upkeep](#upkeep)

## Scope

- Each file mirrors a canonical doc of the same name one level up (`agent-support.md` mirrors [agent-support.md](../agent-support.md)). The canonical doc and the skills in `setup/dotfiles/agent-skills/` win on any conflict; never add a rule here that they lack.
- Prefer Mermaid diagrams with minimal prose; link to the canonical section instead of restating it.

## Upkeep

- When a canonical doc, an agent skill, a command in [agent-commands.md](../agent-commands.md) or an `agentic-`/`manual-`/`cron-` workflow changes how a flow runs, update the matching diagram in the same change.
- Verify node names against the skill or workflow they cite (dispatch commands, workflow file names, runner mediums). Only skills that dispatch appear as dispatch nodes; `local-create-pr` and `local-update-pr` are the implementation skills agents run after dispatch.
- Rebuild each file's ToC when headings change.
