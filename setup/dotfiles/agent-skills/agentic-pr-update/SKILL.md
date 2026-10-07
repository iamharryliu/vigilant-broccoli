---
name: agentic-pr-update
description: In vigilant-broccoli, apply a requested change to an existing PR branch and verify its cumulative result.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Apply the requested instruction to the specified PR, preserving the work already on its branch. Accept a PR number or URL followed by the instruction.

1. In a local session, read `docs/git-workflow.md`, inspect the PR and establish ownership before checking out its branch. Use an isolated checkout if the current tree is shared or dirty. In a sandbox, the runner has already checked out the PR and supplied its body; use that context without repeating setup.
2. Read the existing code and applicable `CONTEXT.md` guidance. Make only the changes required by the instruction, building on the PR's current implementation. Do not expand the request to unrelated cleanup.
3. Run appropriate existing checks and report the outcome. Describe the PR's cumulative result and remaining work, not only this increment.
4. Leave local changes uncommitted unless publishing was separately authorized. Sandbox runners own staging, committing, pushing and updating PR metadata; do not perform those operations from the agent prompt.

For the unattended sandbox version, run `pnpm agentic-pr-update <pr> "<instruction>"`.
