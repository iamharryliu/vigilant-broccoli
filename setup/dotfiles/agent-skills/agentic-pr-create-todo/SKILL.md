---
name: agentic-pr-create-todo
description: In vigilant-broccoli, refine an initial request using repo research into an actionable task prompt and add one well-cited row to the repo root TODO.md.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If the current directory is outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Turn the initial request in the arguments (or in this conversation) into a clear, repo-informed task prompt, then use it to create a well-researched entry in the repo root `TODO.md`.

1. Read `docs/todo-pattern.md` — it is the source of truth for `TODO.md`'s sections, columns, priority values, row rules, and the machine-read contract. Follow it exactly.
2. Research before writing: grep the repo for every file, workflow, config, and doc the task touches so the `Description` and `Recommended Fix` cells cite concrete paths and existing patterns rather than vague descriptions.
3. Check `CONTEXT.md` and the docs it links for conventions that constrain the task (e.g. Upptime checks for deployed services, no new GitHub repo secrets, cheatsheet/README/badge sync rules) and bake them into the `Recommended Fix`.
4. Craft a self-contained task prompt from the user's intent and the research: state the current problem and evidence, desired behavior, affected paths, existing patterns to follow, scope and constraints, and concrete acceptance criteria with appropriate verification. Preserve the requested outcome; distinguish confirmed facts from assumptions and do not add unrelated work. Check existing TODO rows for overlap before adding a duplicate.
5. Proceed with reasonable assumptions and state them in the prompt. In an interactive session, ask a focused question only if missing information materially changes the task's outcome or scope. In a headless run, record unresolved questions and avoid inventing requirements.
6. Add one row under the most fitting section, inserted in priority order among that section's existing rows. Put the researched current state and motivation in `Description`; put the actionable prompt's desired behavior, implementation guidance, constraints and acceptance criteria in `Recommended Fix`, using the table encoding from `docs/todo-pattern.md` so the solver receives them when it extracts the row.
7. Report the refined task prompt and the added row's ID. Only `TODO.md` may change; do not implement the task or commit.

For the unattended sandbox + PR version, run `pnpm agentic-pr-create-todo "<description>"` instead.
