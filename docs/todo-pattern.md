# TODO.md Pattern

Source of truth for the shape of the repo root `TODO.md`. `/create-todo-task`, `infrastructure/agent-sandbox/create-todo-runner.sh`, `audit-todo-runner.sh`, and the `solve-todo*.sh` parsers all follow this file — change the format here first, then the consumers.

## Structure

- A Table of Contents, then one `## <Category>` section per category: `Security`, `Performance`, `Maintenance`, `Refactor`, `Feature Enhancements`, `UI Cleanup`, `Not so serious`.
- A section may open with a short prose paragraph giving its context before the table.
- Each section is one markdown table with the columns `ID | Priority | Description | Recommended Fix`.
- Rows are ordered by priority: `P1` (highest) → `P2` → `P3`, then `NA`.
- New sections (and their TOC entry) are only added when the user asks for one.

## Row Rules

- `ID`: a unique, bare 6-hex id (no link). Generate with `python3 -c "import random; print(format(random.randint(0, 0xffffff), '06x'))"` and confirm it does not already appear in the file.
- `Priority`: `P1`/`P2`/`P3` for Security, Performance, Maintenance, Refactor, and UI Cleanup items; `NA` for Feature Enhancements and Not so serious items (nice-to-have or deliberately-accepted risk).
- `Description`: current state with concrete file references (`path/to/file.ext:12` where useful) and why it matters. Not so serious items migrated from an accepted-risk finding are prefixed `[security · non-risk]` / `[performance · non-risk]`.
- `Recommended Fix`: the desired end state and remediation, naming an existing repo pattern to follow when one exists. Multi-step fixes are written `1. …<br>2. …<br>3. …` (a table cell cannot hold a real newline) and include the reference-update/cleanup steps (docs, workflows, links, status checks) so nothing dangles.
- Escape a literal `|` inside a cell as `\|`; keep the whole row on one physical line.

## Machine-Read Contract

`infrastructure/agent-sandbox/solve-todo.sh` and `solve-todo-runner.sh` locate, extract, and remove an item by matching `^| <id> |` at the start of its row (`<br>` is expanded to newlines and `\|` unescaped on extraction). Keep the id in the leading cell and the row on one line, or `pnpm agentic:task:solve <id>` cannot find it.

`audit-todo-runner.sh` diffs the same `^| <id> |` match before and after its run and aborts rather than committing if an id vanished without being reported resolved, or if one was added or renumbered. An id is a permanent handle: correct a row in place, never reissue it.

## Staleness

Rows describe the tree at the moment they were written, so they rot as the code moves — a renamed file, a shifted line number, a count that grew, a claim whose scope narrowed. `pnpm agentic:task:audit` (weekly via `cron-agentic-todo-audit`) re-verifies rows against the current tree and opens a PR that deletes the resolved ones and corrects the drifted ones. It never adds rows; a new problem found while auditing belongs to `/create-todo-task`.

When correcting a row by hand, the same rule applies: a cited file that is missing is usually evidence the code moved, not that the problem is fixed — search by basename and symbol before deleting a row. Note that `projects/nx-workspace/apps/ui/pages-index/public/claude-context/` holds a build-time copy of `TODO.md`; it is gitignored and regenerated, so never edit it.
