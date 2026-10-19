---
name: agentic-pr-create
description: In vigilant-broccoli, implement TODO items or a free-text task using repo conventions and verify the result.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Implement TODO IDs or a free-text request (`--prompt` selects free text).

1. Follow applicable repository guidance and [pull request scope](../../../../docs/agent-support.md#pull-request-scope). Resolve named TODO IDs using both row cells (or the runner's extracted row); report unknown IDs.
2. Implement one mergeable increment and run appropriate existing checks plus `docs/refactor-code-cleanup.md`. If the request should not change anything, make no edits and give the reason per [no-change decisions](../../../../docs/agent-support.md#task-contract). Follow repository rules on adding tests and [documentation placement](../../../../docs/agent-support.md#documentation-placement).
3. For larger requests, follow the [increment contract](../../../../docs/agent-support.md#increment-contract): the sandbox receives remaining work in `increments`; locally provide ready-to-run follow-up prompts. Separately authorized local publishing uses the same independent/stacked PR rules and stops at the first failed increment.
4. Remove only TODO rows fully resolved by this increment. In a sandbox, leave `TODO.md` to the runner and declare resolved IDs in `todo_ids`.
5. Report changes, verification, assumptions and remaining work. Local invocation does not authorize commits, pushes or PRs; sandbox runners own publishing.

Unattended entry point: `pnpm agentic-pr-create <id...>` or `pnpm agentic-pr-create --prompt "<task>"`.
