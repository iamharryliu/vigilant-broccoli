---
name: gh-update-pr
description: In vigilant-broccoli, research a change, CI fix or conflict resolution for an existing pull request locally, settle blocking questions with the user, then dispatch the manual-agentic-pr-update workflow with a self-contained instruction.
---

Use the current vigilant-broccoli Git root and run `gh` from it. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `gh-update-pr` invocation; it authorizes one workflow dispatch. Make no local file edits.

1. Follow the [dispatch contract](../../../../docs/agent-support.md#dispatch-contract), update variant (PR selection, research, open-state and scope check, ask, instruction). Infer the operation: failing checks mean `fix-ci`, merge conflicts mean `resolve-conflicts` (no instruction; leave it blank), otherwise `change` (instruction required).
2. Dispatch per the contract. Add `-f with_ci_logs=true` or `-f model=opus` only when the user asks or the task needs it:

   ```sh
   gh workflow run manual-agentic-pr-update.yml -f pr=<n> -f operation=<op> -f instruction="<instruction>"
   ```

3. Find the run with `gh run list --workflow manual-agentic-pr-update.yml --limit 1 --json url,createdAt` and report its URL with the dispatched instruction. Do not wait for the run.
