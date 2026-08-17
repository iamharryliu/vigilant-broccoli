Create a well-researched task entry in the repo root `TODO.md` for the feature, fix, or migration described in the arguments (or in this conversation).

1. Read `TODO.md` to learn its structure: a Table of Contents, then one section per category (`## Security`, `## Performance`, `## Maintenance`, `## Feature Enhancements`, `## Not so serious`). Each section is a markdown table with the columns `ID | Priority | Description | Recommended Fix`, and rows are ordered by priority (`P1` highest → `P2` → `P3`, then `NA`).
2. Research before writing: grep the repo for every file, workflow, config, and doc the task touches. The `Description` and `Recommended Fix` cells must cite concrete paths (with line numbers where useful, e.g. `path/to/file.ext:12`) and name an existing pattern to follow when one exists — not vague descriptions.
3. Check `CLAUDE.md` for conventions that constrain the task (e.g. Upptime checks for deployed services, no new GitHub repo secrets, cheatsheet/README/badge sync rules) and bake them into the `Recommended Fix`.
4. Generate a unique 6-hex id (e.g. `python3 -c "import random; print(format(random.randint(0, 0xffffff), '06x'))"`) and verify it doesn't already appear in `TODO.md`.
5. Add one table row under the most fitting section (create the section — and its TOC entry — only if the user asked for a new one), inserted in priority order among that section's existing rows:
   - `ID`: the bare 6-hex id (no link).
   - `Priority`: `P1`/`P2`/`P3` for Security/Performance/Maintenance items; `NA` for Feature Enhancements and Not-so-serious items (which carry no priority).
   - `Description`: current state with file references, and why it matters. For Not-so-serious items migrated from an accepted-risk finding, prefix with `[security · non-risk]` / `[performance · non-risk]`.
   - `Recommended Fix`: the desired end state and remediation. Write a multi-step fix as `1. …<br>2. …<br>3. …` (use `<br>`, since a table cell can't contain a real newline). Include the reference-update/cleanup steps so nothing dangles after the change (docs, workflows, links, status checks).
   - Escape any literal `|` inside a cell as `\|` so it doesn't break the table columns; keep the whole row on one physical line.
6. Do not implement the task — the deliverable is the TODO row only. Do not commit.

Note: the row format is machine-read — `infrastructure/agent-sandbox/solve-todo.sh` and `solve-todo-runner.sh` locate/extract/remove an item by matching `^| <id> |` at the start of its row, so keep the id in the leading cell.
