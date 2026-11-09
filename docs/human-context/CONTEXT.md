# Agent Context — docs/human-context/

Diagrams and overviews for people; agents never read them for rules.

## Table of Contents

- [Scope](#scope)
- [Upkeep](#upkeep)
- [Agentic Workflow](#agentic-workflow)
  - [Pre-Dispatch Steps](#pre-dispatch-steps)
  - [Agent Dispatch Options](#agent-dispatch-options)
  - [Update Variant](#update-variant)

## Scope

- Each `##` section below the upkeep rules mirrors a canonical doc one level up ([Agentic Workflow](#agentic-workflow) mirrors [agent-support.md](../agent-support.md)). The canonical doc and the skills in `setup/dotfiles/agent-skills/` win on any conflict; never add a rule here that they lack.
- Prefer Mermaid diagrams with minimal prose; link to the canonical section instead of restating it.

## Upkeep

- When a canonical doc, an agent skill, a command in [agent-commands.md](../agent-commands.md) or an `agentic-`/`manual-`/`cron-` workflow changes how a flow runs, update the matching diagram in the same change.
- Verify node names against the skill or workflow they cite (dispatch commands, workflow file names, runner mediums). Only skills that dispatch appear as dispatch nodes; `local-create-pr` and `local-update-pr` are the implementation skills agents run after dispatch.
- Rebuild the ToC when headings change.

## Agentic Workflow

Diagrams of how the agentic create/update commands work. Canonical rules live in [agent-support.md](../agent-support.md); the command list is in [agent-commands.md](../agent-commands.md).

### Pre-Dispatch Steps

```mermaid
flowchart TD
  B[Read-only research of the request from args or conversation] --> C{Should it be built?}
  C -- No --> S[Stop and explain]
  C -- Yes --> D{Blocking questions?}
  D -- Yes --> E[Ask up to 4 questions]
  D -- No --> F[Write self-contained prompt]
  E --> F
  F --> G[Pick model by complexity]
  G --> H[Agent Dispatch]
```

### Agent Dispatch Options

```mermaid
flowchart LR
  H[Agent Dispatch]

  subgraph Local
    TC["/local-create-pr-claude"] --> WT[Detached tmux session on a fresh worktree]
    TX["/local-create-pr-codex"] --> WT
    DC["/local-docker-create-pr-claude"] --> SB[Background Docker sandbox]
    DX["/local-docker-create-pr-codex"] --> SB
  end

  subgraph GitHub
    GH["/gh-create-pr"] --> GHA[manual-agentic-pr-create workflow]
  end

  subgraph Remote
    RM["/remote-create-pr-codex"] --> VM[code-server VM]
  end

  H --> TC
  H --> TX
  H --> DC
  H --> DX
  H --> GH
  H --> RM
  WT --> IMPL["/local-create-pr"]
  SB --> IMPL
  GHA --> IMPL
  VM --> IMPL
  IMPL --> PR[Pull request]
```

### Update Variant

```mermaid
flowchart TD
  A[Existing PR] --> B[Research PR, checks, mergeability, review comments]
  B --> C{Open and related to the PR purpose?}
  C -- No --> S[Stop; suggest /gh-create-pr for a follow-up]
  C -- Yes --> D[Write instruction]
  D --> E{Kind of update}
  E --> F[change]
  E --> G[fix-ci]
  E --> H[resolve-conflicts]
  F --> I["/gh-update-pr dispatches manual-agentic-pr-update"]
  G --> I
  H --> I
```
