---
name: local-update-pr-claude
description: In vigilant-broccoli, research a change, CI fix or conflict resolution for an existing pull request, settle blocking questions with the user, then start Claude in a detached tmux session on a worktree of the PR branch to apply it and push to the PR.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `local-update-pr-claude` invocation; it authorizes one tmux session whose agent updates the existing PR branch and pushes to it. Make no edits in this checkout.

1. Follow the [dispatch contract](../../../../docs/agent-support.md#dispatch-contract), update variant (PR selection, research, open-state and scope check, ask, instruction). For unrelated work, suggest `local-create-pr-claude`.
2. Create a worktree of the PR's head branch (`gh pr view <pr> --json headRefName`) from its freshly fetched remote under `.claude/worktrees/` so it survives session restarts. A PR from a fork has no `origin` branch to push to; report that instead of dispatching.

   ```sh
   git fetch origin <branch>
   git worktree add -B <branch> .claude/worktrees/<slug> origin/<branch>
   ```

   If `<branch>` is already checked out elsewhere, report where and stop; never switch a peer's worktree.

3. Append to the instruction: work only in this worktree, follow its `CONTEXT.md` files, apply the change per the `local-update-pr` skill (`local-update-pr-fix-ci` for failing checks, `local-update-pr-resolve-conflicts` for conflicts), then publish to the existing PR with the `ship-pr` skill, which this request authorizes. The task stays on this PR's purpose.
4. Write the instruction to `/tmp/vb-local-pr-<slug>.prompt` and start the session once no questions were asked or after the user confirms it, with the contract's chosen Claude model as `<model>`:

   ```sh
   tmux new-session -d -s vb-pr-<slug> -c "$PWD/.claude/worktrees/<slug>" \
     'claude --model <model> --permission-mode auto "$(cat /tmp/vb-local-pr-<slug>.prompt)"'
   ```

5. Report the PR, branch, worktree, instruction, model with its reason and `tmux attach -t vb-pr-<slug>`. Do not wait; the session ends with the agent's PR URL or a failure visible on attach.
