---
name: local-docker-create-pr-codex
description: In vigilant-broccoli, research a feature, enhancement or fix request locally, settle blocking questions with the user, then start a background local Docker sandbox solve with Codex using a self-contained prompt.
---

Use the current vigilant-broccoli Git root and run `pnpm` from it. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `local-docker-create-pr-codex` invocation; it authorizes one background solve, which publishes a PR from a throwaway clone. Make no local file edits.

1. Follow `local-docker-create-pr-claude` step 1 (research, questions and prompt).
2. Start the solve once no questions were asked or after the user confirms the final prompt. Codex runs in the running dev sandbox with its signed-in Codex login (`pnpm agentic:dev-sandbox:up`, then `pnpm agentic:dev-sandbox:codex:auto`), and the command detaches itself after preflight. Add `--codex-model <model>` only when the user asks:

   ```sh
   pnpm agentic-pr-create --agent codex --prompt "<prompt>"
   ```

3. Report the `Started in the background` line with its `tail -f` log path and the dispatched prompt. Do not wait for the solve; if preflight says the dev sandbox is down or Codex is signed out, report the error and the command that fixes it.
4. Follow the log only when the user asks; report its `PR_URL::` line or failure.
