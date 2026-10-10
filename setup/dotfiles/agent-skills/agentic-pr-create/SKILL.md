---
name: agentic-pr-create
description: In vigilant-broccoli, implement TODO items or a free-text task using repo conventions and verify the result.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Implement the requested task in the current vigilant-broccoli checkout. Accept TODO IDs or a free-text request; `--prompt` explicitly selects free text, and a free-text request may itself name TODO IDs.

1. Read applicable `CONTEXT.md` files and the documents they require. Inspect the existing implementation and reuse its patterns. Keep changes focused on the requested outcome. When adding documentation or context, place it per [documentation placement](../../../../docs/agent-support.md#documentation-placement) rather than in the root `CONTEXT.md` by default.
2. For TODO IDs, read `docs/todo-pattern.md` and locate each exact ID in `TODO.md`; use both its Description and Recommended Fix as the task. If the runner supplied an extracted row, use that row directly. Report an unknown ID rather than guessing. For free text, use the supplied request and session context, and resolve any TODO IDs it names the same way, per [pull request scope](../../../../docs/agent-support.md#pull-request-scope).
3. Scope the change as one independently mergeable increment per [pull request scope](../../../../docs/agent-support.md#pull-request-scope). When the request bundles independent changes or is too large for one reviewable PR, implement the first increment only and list the rest as follow-up prompts in the report and the PR's next steps.
4. Implement the task and run appropriate existing checks. Apply `docs/refactor-code-cleanup.md` before finishing. Follow repository rules on adding tests.
5. For a completed TODO task, remove only its own row, including rows named in a free-text request. When a sandbox runner owns TODO cleanup, leave `TODO.md` untouched and let it remove the row after verification. Keep unfinished items.
6. Report the changes, verification results, assumptions and remaining work. Local invocation does not authorize committing, pushing or opening a PR; the sandbox runner handles those operations in unattended runs.

For the unattended sandbox + PR version, run `pnpm agentic-pr-create <id...>` or `pnpm agentic-pr-create --prompt "<task>"`.
