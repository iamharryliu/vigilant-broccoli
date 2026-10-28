---
name: local-pr-create-todo
description: In vigilant-broccoli, refine an initial request using repo research into an actionable task prompt and add one well-cited row to the repo root TODO.md.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Turn the request into a researched task in root `TODO.md`; do not implement it.

1. Read `docs/todo-pattern.md` for format and ID rules. Inspect relevant code and context, cite concrete paths plus quoted snippets or symbols (never line numbers), and check existing rows for overlap.
2. Write a self-contained prompt covering the problem/evidence, desired behavior, affected paths, existing patterns, constraints and acceptance checks. State assumptions; ask locally only when missing information materially changes scope or outcome. In headless runs, record unresolved questions.
3. Add one row with the fitting `Type`, placed after that Type's rows of the same or higher priority: current state/motivation in Description, actionable guidance in Recommended Fix, a standalone Brief summarizing both, and `Agent`/`Effort`/`Model` set per the pattern's Row Rules. Large tasks use ordered mergeable increments per [pull request scope](../../../../docs/agent-support.md#pull-request-scope); independent tasks without prerequisites may use separate rows.
4. Report the refined prompt and row ID. If an existing row already covers the request, add nothing and give the reason, naming that row's ID, per [no-change decisions](../../../../docs/agent-support.md#task-contract). Only `TODO.md` may change; do not commit.

Unattended entry point: `pnpm agentic-pr-create-todo "<description>"`.
