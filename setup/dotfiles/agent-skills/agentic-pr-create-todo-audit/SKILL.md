---
name: agentic-pr-create-todo-audit
description: In vigilant-broccoli, verify every TODO.md row against the current tree, remove resolved entries, and correct drifted references without adding tasks.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If the current directory is outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Audit the repo root `TODO.md` for entries that no longer match the codebase, and correct it in place.

Every row was accurate when written. The repo has moved since. Your job is to re-verify each row against the tree as it exists right now and bring the file back into agreement with reality.

Audit every row in every section.

For each row, reach exactly one verdict, and gather the evidence BEFORE deciding:

1. RESOLVED — the condition the row describes no longer exists (the guard was added, the dependency dropped, the file deleted with nothing replacing it). Delete the whole row.
2. DRIFTED — the condition still exists, but the row misdescribes it: a moved or renamed file, a stale line number, a count that has changed, a claim whose scope is now narrower or wider than the row states. Rewrite only the inaccurate parts of the Description / Recommended Fix cells.
3. ACCURATE — still true as written. Leave the row byte-identical.

Verification rules — these decide the quality of the whole run:

- Never judge a row from its own wording. Open the files it cites and read the surrounding code.
- A file that is missing at the cited path is NOT evidence of RESOLVED. Search for it by basename and by symbol name first — most such rows are DRIFTED (the code moved), not resolved. Check "git log --oneline -5 -- <path>" to see whether it was deleted or relocated.
- Treat a path that is generated or gitignored as not a source of truth: check .gitignore and the build targets before citing one.
- Only mark RESOLVED when you have positively confirmed the fix exists — a guard you can read, a dependency absent from package.json, a setting changed. "I could not find the problem" is not confirmation.
- When a row bundles several claims and only some are now false, it is DRIFTED: narrow the row to the claims that still hold rather than deleting it.
- Line numbers cited as "path:12" must be re-checked and corrected even when the surrounding claim is accurate.

Editing rules:

- docs/todo-pattern.md is the source of truth for the file's structure, columns, priority values, row rules, and the machine-read id contract. Re-read it before editing and follow it exactly.
- NEVER change, reuse or renumber an existing 6-hex id. Ids are stable handles that "pnpm agentic-pr-create <id>" resolves; a changed id breaks it.
- Do not add new rows. Finding an unrelated new problem is out of scope for this audit — that is what /agentic-pr-create-todo is for. Mention it in the completion report instead.
- Do not change a row's Priority unless the row's own evidence changed (e.g. the blast radius is now provably smaller). Priority is the owner's call, not a tidying opportunity.
- Keep each row on one physical line, keep the id in the leading cell, write multi-step fixes with "<br>", and escape a literal pipe inside a cell.
- Preserve section order, the Table of Contents, and each section's priority ordering. If deleting rows empties a section, keep the section and its header.
- Do not touch any file besides TODO.md.
- Do not commit or publish changes. Read-only Git history inspection is allowed when needed to verify a row.

It is a perfectly good outcome to find nothing wrong. If every row is ACCURATE, make no edit to TODO.md at all. Do not invent a change to justify the run.

Report each resolved or drifted row by ID with its evidence, and the count of accurate rows. Only `TODO.md` may change; do not implement the tasks.

For the unattended sandbox + PR version, run `pnpm agentic-pr-create-todo-audit` instead.
