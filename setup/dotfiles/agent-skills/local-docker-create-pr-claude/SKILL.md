---
name: local-docker-create-pr-claude
description: In vigilant-broccoli, research a feature, enhancement or fix request locally, settle blocking questions with the user, then start a background local Docker sandbox solve with Claude using a self-contained prompt.
---

Use the current vigilant-broccoli Git root and run `pnpm` from it. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `local-docker-create-pr-claude` invocation; it authorizes one background solve, which publishes a PR from a throwaway clone. Make no local file edits.

1. Follow the [dispatch contract](../../../../docs/agent-support.md#dispatch-contract) (request, research, stop, ask, prompt). For a request that only drops TODO rows, start one solve per ID.
2. Start the solve in the background with the Bash tool's `run_in_background`, once no questions were asked or after the user confirms the final prompt. Add `--model opus` or another Claude model only when the user asks:

   ```sh
   pnpm agentic-pr-create --prompt "<prompt>"
   ```

3. Read the first output for the `Logs:` or log path and report it with the dispatched prompt. Do not wait for the solve; a failed preflight (Docker, Vault or token errors) is reported verbatim.
4. When the run finishes and its notification arrives, report the `PR_URL::` line from the output, or the failure.
