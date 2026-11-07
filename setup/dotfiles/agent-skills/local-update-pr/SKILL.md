---
name: local-update-pr
description: In vigilant-broccoli, apply a requested change to an existing PR branch and verify its cumulative result.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Apply a PR number/URL plus instruction to the existing branch, preserving its work.

1. Locally, follow `docs/git-workflow.md`, inspect the PR and establish ownership before checkout; use an isolated checkout if shared or dirty. A sandbox runner supplies the checked-out PR and body; do not repeat setup.
2. Follow applicable context and [task contract](../../../../docs/agent-support.md#task-contract). Keep this PR on its purpose and never split or stack: work outside it, or too large for this PR, is a no-change decision with a reason. Locally list a ready-to-run `pnpm agentic-pr-create --prompt` for unrelated work.
3. Resolve TODO IDs named in the instruction; remove only fully resolved rows locally. In a sandbox, leave `TODO.md` to the runner and declare those IDs in `todo_ids`. An instruction that only removes a named TODO row is valid and needs no other change. When this update changes behavior a person can check (apps, libs, infrastructure services, workflows or dotfiles; not `docs`/`chore`), add or fold one `QA` row per affected project per [QA rows](../../../../docs/todo-pattern.md#qa-rows), in a sandbox too, linking this PR by its URL. Place new docs per [documentation placement](../../../../docs/agent-support.md#documentation-placement).
4. If the instruction should not change the branch (already done, outside the PR's purpose, or wrong for the repo), make no edits and give the reason per [no-change decisions](../../../../docs/agent-support.md#task-contract). Otherwise run appropriate existing checks and report the PR's cumulative result, verification and remaining work.
5. On failure, locally leave changes uncommitted unless publishing was separately authorized; a failed sandbox run publishes nothing. Runners own Git publishing and PR metadata.

Unattended entry point: `pnpm agentic-pr-update <pr> "<instruction>"`.
