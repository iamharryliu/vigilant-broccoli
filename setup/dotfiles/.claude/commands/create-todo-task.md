---
description: Research a feature, fix, or migration and add one well-cited row to the repo root TODO.md.
argument-hint: <task description>
---

Create a well-researched task entry in the repo root `TODO.md` for the feature, fix, or migration described in the arguments (or in this conversation).

1. Read `docs/todo-pattern.md` — it is the source of truth for `TODO.md`'s sections, columns, priority values, row rules, and the machine-read contract. Follow it exactly.
2. Research before writing: grep the repo for every file, workflow, config, and doc the task touches so the `Description` and `Recommended Fix` cells cite concrete paths and existing patterns rather than vague descriptions.
3. Check `CLAUDE.md` and the docs it links for conventions that constrain the task (e.g. Upptime checks for deployed services, no new GitHub repo secrets, cheatsheet/README/badge sync rules) and bake them into the `Recommended Fix`.
4. Add one row under the most fitting section, inserted in priority order among that section's existing rows.
5. Do not implement the task — the deliverable is the TODO row only. Do not commit.

For the unattended sandbox + PR version, run `pnpm agentic:task:create "<description>"` instead.
