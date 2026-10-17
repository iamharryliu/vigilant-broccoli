---
name: ship-pr
description: In vigilant-broccoli, branch, commit, sync with main, push, and open a PR for files edited in this session.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `ship-pr` invocation. Read `docs/git-workflow.md` for conventions and concurrent-session safety; this command authorizes publishing this session's changes.

1. Decide where to publish. Unless this checkout is provably exclusive to this session, create a separate worktree off freshly fetched `origin/main` and apply only this session's changes there. A best-effort `ListAgents` check is a hint only; an empty list never proves exclusivity. In an exclusively owned checkout, keep the in-place flow below.
2. Inspect staged/unstaged diffs and drop comments your diff adds that the comment rule in `docs/refactor-code-cleanup.md` removes. Stage only owned files; leave pre-existing work alone, and ask rather than guess when unsure whether this session touched a file. Keep a branch already selected for this task, otherwise branch from freshly fetched `origin/main` using the naming convention.
3. Commit with the required message and environment-provided attribution. If peer work is staged, use `git commit -m "<message>" -- <your paths>`. Follow `setup/dotfiles/agent-skills/sync-main/SKILL.md` before pushing; never stash shared work. Push normally (`-u origin <branch>` when new).
4. Create/update the branch's PR through `infrastructure/agent-sandbox/merge-pr-body.py`, using the cumulative result and conventions in `docs/git-workflow.md`:
   - Set `PR_SUMMARY` bullets, `PR_NEXT_STEPS` checkboxes, `PR_CONCERNS` bullets for risks, limitations, unverified behavior or open questions the reviewer must weigh, and `PR_SUGGESTIONS` optional follow-up bullets. Always set `PR_CONCERNS` and `PR_SUGGESTIONS` (empty string when none, or after resolving, implementing or rejecting the earlier ones) so the helper drops stale entries.
   - Set `HISTORY_SOURCE` to the authoring CLI's `Local agent (Claude Code)` or `Local agent (Codex)`, `HISTORY_COMMAND=ship-pr`, `HISTORY_PROMPT` to a one-sentence request summary, `HISTORY_SUMMARY` to the commit message, and `HISTORY_DATE` to the UTC date.
   - For an existing PR, fetch its body into `CURRENT_BODY`; write the helper output to a temporary file and use `gh pr edit --body-file`.
   - For a new PR, `CURRENT_BODY` contains the environment's attribution when provided. Use `gh pr create --title "<PR_TITLE>" --body-file`; the title defaults to the commit subject and must satisfy commitlint, including the final period and no truncation.
   - If the helper is absent on an older branch, use `## Summary` / `## Next steps` instead.
5. Restore the original branch only if this workflow switched it in an exclusive checkout. After publishing from a separate worktree, remove the shipped changes from the source only where they contain no mixed user/peer edits; leave mixed files dirty and report them. Verify unrelated changes remain intact.
6. Return the PR URL and any remaining work.
