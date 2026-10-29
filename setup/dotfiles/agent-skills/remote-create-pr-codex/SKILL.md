---
name: remote-create-pr-codex
description: In vigilant-broccoli, research a feature, enhancement or fix request locally, settle blocking questions with the user, then start a Codex solve on the code-server VM using a self-contained prompt.
---

Use the current vigilant-broccoli Git root and run `pnpm` from it. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `remote-create-pr-codex` invocation; it authorizes one solve on the code-server VM, which publishes a PR from a fresh worktree off `origin/main`. Make no local file edits.

1. Follow `local-docker-create-pr-claude` step 1 (research, questions and prompt). The VM solves from `origin/main`, so unpushed local changes are not visible to it; say so when the request depends on them.
2. Start the solve once no questions were asked or after the user confirms the final prompt. It streams over SSH and detaches into a VM tmux session, so the Mac may sleep afterwards. Add `--codex-model <model>` only when the user asks, and `--codex-signed-in` only when the user asks or the command reports no Vault token:

   ```sh
   pnpm agentic-pr-create --vm --agent codex --prompt "<prompt>"
   ```

3. Report the run name, its `/config/agentic-runs/<run>/run.log` path and the dispatched prompt. Do not wait for the solve; report preflight failures (Vault, SSH, or a missing `/config/.codex/auth.json`) verbatim with the fix, e.g. `codex login --device-auth` on the VM.
4. Follow the log with `pnpm code-server:ssh` only when the user asks; report its `PR_URL::` line or `RUN_EXIT::<status>` failure.
