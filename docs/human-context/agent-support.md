# Agent Support (Human Overview)

Diagrams of how the agentic create/update commands work. Canonical rules live in [agent-support.md](../agent-support.md); the command list is in [agent-commands.md](../agent-commands.md).

## Table of Contents

- [Shared Front End](#shared-front-end)
- [Dispatch Mediums](#dispatch-mediums)
- [Update Variant](#update-variant)

## Shared Front End

```mermaid
flowchart TD
  A[Request from args or conversation] --> B[Read-only research]
  B --> C{Should it be built?}
  C -- No --> S[Stop and explain]
  C -- Yes --> D{Blocking questions?}
  D -- Yes --> E[Ask up to 4 questions]
  D -- No --> F[Write self-contained prompt]
  E --> F
  F --> G[Pick model by complexity]
  G --> H[Dispatch]
```

## Dispatch Mediums

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

## Update Variant

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
