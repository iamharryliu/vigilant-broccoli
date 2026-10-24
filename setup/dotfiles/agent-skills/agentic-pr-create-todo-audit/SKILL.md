---
name: agentic-pr-create-todo-audit
description: In vigilant-broccoli, verify every TODO.md row against the current tree, remove resolved entries, and correct drifted references without adding tasks.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Verify every row in root `TODO.md` against current source, following `docs/todo-pattern.md`. Only `TODO.md` may change; do not implement tasks or publish.

For each row:

- **RESOLVED:** positively confirm the condition was fixed or removed, then delete the row.
- **DRIFTED:** the issue remains; correct only inaccurate Description/Recommended Fix claims, paths, lines or counts, and update the Brief when its summary no longer holds. Partly resolved rows retain their remaining claims.
- **ACCURATE:** leave byte-identical.

Open cited files and surrounding code. A missing path alone proves nothing: search basename/symbol and inspect `git log --oneline -5 -- <path>` for moves. Check ignore rules/build targets before treating generated paths as source. Recheck cited line numbers.

Preserve IDs and the Type-then-priority row order. Add no rows; change Type, Priority, Agent or Effort only when the row's evidence changes. Use the pattern's one-line rows, `<br>` steps and escaped pipes. Leave accurate files untouched.

Report resolved/drifted IDs with evidence, the accurate count and unrelated findings without adding them to the backlog.

Unattended entry point: `pnpm agentic-pr-create-todo-audit`.
