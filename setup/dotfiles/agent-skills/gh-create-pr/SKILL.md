---
name: gh-create-pr
description: In vigilant-broccoli, research a feature, enhancement or fix request locally, settle blocking questions with the user, then dispatch the manual-agentic-pr-create workflow with a self-contained prompt.
---

Use the current vigilant-broccoli Git root and run `gh` from it. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `gh-create-pr` invocation; it authorizes one workflow dispatch. Make no local file edits.

1. Follow the [dispatch contract](../../../../docs/agent-support.md#dispatch-contract) (request, research, stop, ask, prompt) to the final prompt.
2. Dispatch per the contract with its chosen Claude model. Add `-f agent=codex` only when the user asks; Codex then takes `-f codex_model=<model>` only when the user names one, in place of `-f model`:

   ```sh
   gh workflow run manual-agentic-pr-create.yml -f model=<model> -f prompt="<prompt>"
   ```

3. Find the run with `gh run list --workflow manual-agentic-pr-create.yml --limit 1 --json url,createdAt` and report its URL with the dispatched prompt and the model with its reason. Do not wait for the run.
