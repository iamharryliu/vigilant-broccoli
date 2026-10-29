---
name: remote-update-pr-codex
description: In vigilant-broccoli, research an existing PR change, CI fix or conflict resolution locally, settle blocking questions, then start a Codex update on the code-server VM.
---

Use the current vigilant-broccoli Git root and run `pnpm` from it. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `remote-update-pr-codex` invocation; it authorizes one update on the code-server VM, which publishes to the PR's existing branch. Make no local file edits.

1. Follow `gh-update-pr` steps 1–5: select the PR and operation, research the PR and applicable repo guidance read-only, check scope and open state, settle blocking questions and write a self-contained instruction. Follow the cumulative-result requirements of `local-pr-update`. The VM sees the pushed PR branch, not unpushed local changes; say so if the request depends on them. For unrelated work, suggest `remote-create-pr-codex`.
2. Start once no questions were asked or after the user confirms the final instruction. The command streams over SSH and detaches into a VM tmux session, so the workstation may disconnect afterwards:

   ```sh
   pnpm agentic-pr-update --vm --agent codex <PR> "<instruction>"
   ```

   Add `--operation fix-ci` for failing checks (instruction optional), or `--operation resolve-conflicts` for conflicts (omit the instruction). Add `--with-ci-logs` when requested or needed; `fix-ci` implies it. Add `--codex-model <model>` only when requested, and `--codex-signed-in` only when requested or the command reports no Vault token.

3. Report the run name, `/config/agentic-runs/<run>/run.log` path, operation and dispatched instruction. Do not wait or retry a successful dispatch. Report preflight failures verbatim with the fix, including `codex login --device-auth` in the VM terminal for a missing login.
4. Follow the log through `pnpm code-server:ssh` only when asked; report `RUN_EXIT::<status>` and any recovery or follow-up `PR_URL::` lines. The target remains the existing PR.
