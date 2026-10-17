---
name: agentic-pr-update
description: In vigilant-broccoli, apply a requested change to an existing PR branch and verify its cumulative result.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Apply a PR number/URL plus instruction to the existing branch, preserving its work.

1. Locally, follow `docs/git-workflow.md`, inspect the PR and establish ownership before checkout; use an isolated checkout if shared or dirty. A sandbox runner supplies the checked-out PR and body; do not repeat setup.
2. Follow applicable context and [pull request scope](../../../../docs/agent-support.md#pull-request-scope). Keep this PR on its purpose; separate follow-ups through `increments` (`depends_on: "current"` when dependent). Locally list ready-to-run `pnpm agentic-pr-create --prompt` follow-ups, or publish under the increment contract when separately authorized.
3. Resolve TODO IDs named in the instruction; remove only fully resolved rows locally. In a sandbox, leave `TODO.md` to the runner and declare those IDs in `todo_ids`. An instruction that only removes a named TODO row is valid and needs no other change. To reword, reprioritize or correct an existing row, declare the new cells in `todo_edits` per [rewording TODO rows](../../../../docs/agent-support.md#pull-request-scope) in a sandbox (locally edit the row in place per `docs/todo-pattern.md`, keeping its id); neither path adds a row. Place new docs per [documentation placement](../../../../docs/agent-support.md#documentation-placement).
4. If the instruction should not change the branch (already done, outside the PR's purpose, or wrong for the repo), make no edits and give the reason per [no-change decisions](../../../../docs/agent-support.md#task-contract). Otherwise run appropriate existing checks and report the PR's cumulative result, verification and remaining work.
5. On failure, preserve partial work separately from the target PR. Locally leave changes uncommitted unless publishing was separately authorized; the sandbox runner attempts a separate draft PR targeting the original branch, retaining unresolved TODO rows and running hooks. Runners own Git publishing and PR metadata.

Unattended entry point: `pnpm agentic-pr-update <pr> "<instruction>"`.
