---
name: agentic-pr-update
description: In vigilant-broccoli, apply a requested change to an existing PR branch and verify its cumulative result.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Apply the requested instruction to the specified PR, preserving the work already on its branch. Accept a PR number or URL followed by the instruction.

1. In a local session, read `docs/git-workflow.md`, inspect the PR and establish ownership before checking out its branch. Use an isolated checkout if the current tree is shared or dirty. In a sandbox, the runner has already checked out the PR and supplied its body; use that context without repeating setup.
2. Read the existing code and applicable `CONTEXT.md` guidance. Make only the changes required by the instruction, building on the PR's current implementation. Do not expand the request to unrelated cleanup. If the instruction names TODO IDs or bundles work independent of the PR's purpose, follow [pull request scope](../../../../docs/agent-support.md#pull-request-scope): resolve the named rows the PR completes (in a sandbox, declare them in `todo_ids` and leave `TODO.md` to the runner), and publish independent or dependent work as separate follow-up increments through the `increments` metadata instead of growing this PR. When adding documentation or context, place it per [documentation placement](../../../../docs/agent-support.md#documentation-placement) rather than in the root `CONTEXT.md` by default.
3. Keep the PR to its existing purpose per [pull request scope](../../../../docs/agent-support.md#pull-request-scope). Work that is independent of it, or that builds on it, is a separate follow-up increment, not more diff here. In a sandbox, describe each follow-up in the `increments` metadata the runner asks for (`depends_on: "current"` when it needs this PR); the runner publishes them as their own PRs and never touches this PR's purpose. In a local session, list them as ready-to-run `pnpm agentic-pr-create --prompt "<task>"` follow-ups, or publish them under the same independent/stacked rules when publishing was separately authorized. TODO ids named in the instruction are resolved per that section: in a sandbox leave `TODO.md` untouched and declare the ids this update fully resolves in `todo_ids`; locally remove only the rows this update fully resolves.
4. Run appropriate existing checks and report the outcome. Describe the PR's cumulative result and remaining work, not only this increment.
5. If an update fails, preserve unfinished work separately from the target PR and report recovery honestly. In a sandbox, the runner attempts a separate draft PR targeting the original branch, retaining unresolved TODO rows and running commit hooks. Locally leave the partial changes uncommitted unless publishing was separately authorized.
6. Leave local changes uncommitted unless publishing was separately authorized. Sandbox runners own staging, committing, pushing and updating PR metadata; do not perform those operations from the agent prompt.

For the unattended sandbox version, run `pnpm agentic-pr-update <pr> "<instruction>"`.
