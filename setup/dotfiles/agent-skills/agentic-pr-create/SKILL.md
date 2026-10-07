---
name: agentic-pr-create
description: In vigilant-broccoli, implement TODO items or a free-text task using repo conventions and verify the result.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Implement the requested task in the current vigilant-broccoli checkout. Accept TODO IDs or a free-text request; `--prompt` explicitly selects free text.

1. Read applicable `CONTEXT.md` files and the documents they require. Inspect the existing implementation and reuse its patterns. Keep changes focused on the requested outcome.
2. For TODO IDs, read `docs/todo-pattern.md` and locate each exact ID in `TODO.md`; use both its Description and Recommended Fix as the task. If the runner supplied an extracted row, use that row directly. Report an unknown ID rather than guessing. For free text, use the supplied request and session context.
3. Implement the task and run appropriate existing checks. Apply `docs/refactor-code-cleanup.md` before finishing. Follow repository rules on adding tests.
4. For a completed TODO task, remove only its own row. When a sandbox runner owns TODO cleanup, leave `TODO.md` untouched and let it remove the row after verification. Keep unfinished items.
5. Report the changes, verification results, assumptions and remaining work. Local invocation does not authorize committing, pushing or opening a PR; the sandbox runner handles those operations in unattended runs.

For the unattended sandbox + PR version, run `pnpm agentic-pr-create <id...>` or `pnpm agentic-pr-create --prompt "<task>"`.
