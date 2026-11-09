---
name: local-create-pr
description: In vigilant-broccoli, implement TODO items or a free-text task using repo conventions and verify the result.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Implement TODO IDs or a free-text request (`--prompt` selects free text).

1. Follow applicable repository guidance and [task contract](../../../../docs/agent-support.md#task-contract). Resolve named TODO IDs using both row cells (or the runner's extracted row); report unknown IDs.
2. Implement one mergeable pull request and run appropriate existing checks plus `docs/refactor-code-cleanup.md`. Never split or stack. If the request should not change anything, or is too large for one pull request, make no edits and give the reason per [no-change decisions](../../../../docs/agent-support.md#task-contract). For UI-changing work, follow the task contract's screenshot eligibility, capture and embedding rules (sandbox agents list paths in `pr_screenshots` metadata). Follow repository rules on adding tests and [documentation placement](../../../../docs/agent-support.md#documentation-placement).
3. Remove only TODO rows fully resolved by this PR. In a sandbox, leave `TODO.md` to the runner and declare resolved IDs in `todo_ids`.
4. When this PR changes behavior a person can check (apps, libs, infrastructure services, workflows or dotfiles; not `docs`/`chore`), add or fold one `QA` row per affected project with the checks a person should try, per [QA rows](../../../../docs/todo-pattern.md#qa-rows), in a sandbox too. The PR does not exist yet, so write `PR: pending` for its link; the runner or `ship-pr` replaces it after opening the PR. Docs-only and TODO-only changes add none.
5. Report changes, verification, assumptions and remaining work. Local invocation does not authorize commits, pushes or PRs; sandbox runners own publishing.

Unattended entry point: `pnpm agentic-pr-create <id...>` or `pnpm agentic-pr-create --prompt "<task>"`.
