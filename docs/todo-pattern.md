# TODO.md Pattern

Source of truth for the shape of the repo root `TODO.md`. `/local-pr-create-todo`, `infrastructure/agent-sandbox/create-todo-runner.sh`, `audit-todo-runner.sh`, and the `solve-todo*.sh` parsers all follow this file — change the format here first, then the consumers.

## Table of Contents

- [Structure](#structure)
- [Row Rules](#row-rules)
- [Machine-Read Contract](#machine-read-contract)
- [Staleness](#staleness)

## Structure

- A title and one intro paragraph, then a single markdown table with the columns `ID | Type | Priority | Agent | Effort | Model | Brief | Description | Recommended Fix`. No `##` sections or Table of Contents: the dev-dashboard TODO view builds both from `Type`.
- Rows are grouped by `Type` in the order listed under Row Rules, then ordered by priority within a Type: `P1` (highest) → `P2` → `P3`, then `NA`.
- New `Type` values are only added when the user asks for one; add them to `TODO_TYPE_ORDER` in `projects/nx-workspace/apps/ui/vb-manager-next/src/app/constants/todo.ts` too, or the dashboard lists them after the known ones.

## Row Rules

- **Bar for a row**: a row has to be worth a session of someone's time. A micro-optimization whose whole payoff is a few kB of bundle, a few forked processes per shell, or seconds on a manual operator command does not clear it, and neither does a warning with no demonstrated build, deploy, or runtime defect behind it — those are accepted, not deferred. Do not file a grab-bag row collecting several such nits under one id; each would be declined on its own, and bundling them only makes the row harder to decline. A real defect stays a row no matter how small the diff that fixes it.
- `ID`: a unique, bare 6-hex id (no link). Generate with `python3 -c "import random; print(format(random.randint(0, 0xffffff), '06x'))"` and confirm it does not already appear in the file.
- `Type`: one of `Security`, `Performance`, `Maintenance`, `Chore` (operational upkeep with no code defect behind it; `cron-prune-orphaned-services` keeps its orphaned-services row up to date), `Refactor`, `Feature Enhancements`, `UI Cleanup`, `Not so serious`.
- `Priority`: `P1`/`P2`/`P3` for Security, Performance, Maintenance, Chore, Refactor, and UI Cleanup items; `NA` for Feature Enhancements and Not so serious items (nice-to-have or deliberately-accepted risk).
- `Agent`: who can carry the fix to done. `auto` when an agent can implement and verify it entirely in a PR; `assisted` when an agent can write the change but a person must finish it outside the PR (a local `pnpm tf:apply`, secret rotation, npm publish, console setting); `human` when the work is mostly hands-on (hardware, third-party account setup) and an agent can at most update docs afterwards.
- `Effort`: `S` (one file or config block, under an hour), `M` (several files or one service, about a session), `L` (spans services or needs ordered increments).
- `Model`: the Claude model "Run agentic solve" dispatches `manual-agentic-pr-create` with. `haiku` for a mechanical edit that copies an existing pattern; `sonnet` (default) for ordinary implementation; `opus` for security-sensitive design, subtle correctness (SSRF guards, auth, IAM), or `L` work that needs judgment across services; `NA` when `Agent` is `human`.
- `Brief`: two or three plain sentences summarizing the problem and the fix, without file paths or line numbers; the read-only dev-dashboard TODO view shows only this, so it must stand alone. Keep it in sync whenever Description or Recommended Fix changes.
- `Description`: current state with concrete file references (`path/to/file.ext:12` where useful) and why it matters. Not so serious items migrated from an accepted-risk finding are prefixed `[security · non-risk]` / `[performance · non-risk]`.
- `Recommended Fix`: the desired end state and remediation, naming an existing repo pattern to follow when one exists. Multi-step fixes are written `1. …<br>2. …<br>3. …` (a table cell cannot hold a real newline) and include the reference-update/cleanup steps (docs, workflows, links, status checks) so nothing dangles.
- Escape a literal `|` inside a cell as `\|` and keep the whole row on one physical line. Rows are stored unpadded (`| a | b |`, separator cells `---`) in commits and the working tree ([Markdown table compaction](./code-quality-tools.md)), so editing a row changes only that line instead of re-padding the table and colliding with parallel agent PRs.

## Machine-Read Contract

`infrastructure/agent-sandbox/solve-todo.sh` and `solve-todo-runner.sh` locate, extract, and remove an item by matching `^| <id> |` at the start of its row (`<br>` is expanded to newlines and `\|` unescaped on extraction). Keep the id in the leading cell and the row on one line, or `pnpm agentic-pr-create <id>` cannot find it.

`audit-todo-runner.sh` diffs the same `^| <id> |` match before and after its run and aborts rather than committing if an id vanished without being reported resolved, or if one was added or renumbered. An id is a permanent handle: correct a row in place, never reissue it.

## Staleness

Rows describe the tree at the moment they were written, so they rot as the code moves — a renamed file, a shifted line number, a count that grew, a claim whose scope narrowed. `pnpm agentic-pr-create-todo-audit` (weekly via `cron-agentic-pr-create-todo-audit`) re-verifies rows against the current tree and opens a PR that deletes the resolved ones and corrects the drifted ones. It never adds rows; a new problem found while auditing belongs to `/agentic-pr-create-todo`.

When correcting a row by hand, the same rule applies: a cited file that is missing is usually evidence the code moved, not that the problem is fixed — search by basename and symbol before deleting a row. Note that `projects/nx-workspace/apps/ui/context-md/public/notes/` holds a build-time copy of `TODO.md`; it is gitignored and regenerated, so never edit it.
