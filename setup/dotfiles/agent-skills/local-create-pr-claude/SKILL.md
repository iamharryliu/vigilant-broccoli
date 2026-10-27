---
name: local-create-pr-claude
description: In vigilant-broccoli, research a feature, enhancement or fix request, settle blocking questions with the user, then start Claude in a detached tmux session on a fresh worktree to implement it and ship the PR.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `local-create-pr-claude` invocation; it authorizes one tmux session whose agent implements the request and publishes a PR. Make no edits in this checkout.

1. Follow `gh-create-pr` steps 1-5: take the request, research read-only, stop when it should not be built or an existing TODO row covers it, ask only blocking questions and write a self-contained prompt.
2. Choose a branch `<committype>/<short-kebab-case-description>` per `docs/git-workflow.md` and create its worktree off freshly fetched `origin/main` under `.claude/worktrees/` so it survives session restarts:

   ```sh
   git fetch origin main
   git worktree add -b <branch> .claude/worktrees/<slug> origin/main
   ```

3. Append to the prompt: work only in this worktree, follow its `CONTEXT.md` files, run the existing checks, then publish with the `ship-pr` skill, which this request authorizes.
4. Write the prompt to `/tmp/vb-local-pr-<slug>.prompt` and start the session once no questions were asked or after the user confirms it. Add `--model opus` or another Claude model only when the user asks:

   ```sh
   tmux new-session -d -s vb-pr-<slug> -c "$PWD/.claude/worktrees/<slug>" \
     'claude --model sonnet --permission-mode auto "$(cat /tmp/vb-local-pr-<slug>.prompt)"'
   ```

5. Report the branch, worktree, prompt and `tmux attach -t vb-pr-<slug>`. Do not wait; the session ends with the agent's PR URL or a failure visible on attach.
