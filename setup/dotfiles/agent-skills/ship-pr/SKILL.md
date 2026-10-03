---
name: ship-pr
description: In vigilant-broccoli, branch, commit, sync with main, push, and open a PR for files edited in this session.
---

Use the current vigilant-broccoli checkout and resolve repository paths from its Git root. If the current directory is outside that repo, ask which checkout to use; do not operate on the skill installation checkout by default.

Run this workflow only when the user explicitly requests `ship-pr` (including `/ship-pr` or `$ship-pr`). The rules for staging, branch names, commit types and messages, the PR body, git safety, and shared worktrees are the `## Conventions` and `## Concurrent Agent Sessions` sections of `docs/git-workflow.md` — read them first and follow them exactly. `CONTEXT.md`'s `## Git` section carries the standing rules that bind every session.

1. Check whether this worktree is shared with other sessions, using session tools if the environment provides them. A tool listing only this conversation's subagents cannot establish that no other sessions exist. Coordinate with known peers before changing shared Git state. If exclusive use cannot be established, use a separate worktree for publishing; carry over only this session's changes, and preserve the source checkout's branch plus unrelated local changes.
2. Check `git status` and `git diff` (staged and unstaged). Read your own diff before staging and drop any comment it adds that restates the code, labels a block with its own code's words, or explains a self-describing config flag — see the comment rule in `CONTEXT.md`'s `## Coding Conventions` and the checklist in `docs/refactor-code-cleanup.md`. Stage only the files this session created or edited, per the staging rule; if unsure whether a file was touched this session, leave it unstaged and ask rather than guessing from the diff. Anything staged that this session did not stage belongs to a peer — leave it alone.
3. Determine the target branch:
   - If the conversation already checked out or discussed a specific non-main branch for these changes (e.g. a PR branch fetched via `gh pr checkout`), commit there directly — do not create a new branch.
   - Otherwise fetch `origin main` and create a branch from `origin/main` named per the convention. Preserve this session's changes when moving them to that branch or a separate worktree; do not pull main into an unrelated current branch.
4. Commit with a message in the conventional format, ending with the environment's `Co-Authored-By:` trailer. If anything you do not own is staged, commit by pathspec — `git commit -m "<message>" -- <your paths>` — so a peer's staged work cannot ride along; everything after `--` is read as a filename, so `-m "<message>"` has to come before it.
5. Read and follow `setup/dotfiles/agent-skills/sync-main/SKILL.md` so the PR opens mergeable instead of stale. Resolve conflicts now, while they are small; if one needs the user's judgement, stop and ask. On a shared worktree, skip its stash step — never stash a peer's uncommitted work.
6. Push: `git push -u origin <branch>` for a new branch, plain `git push` if it already tracks a remote.
7. If an open PR already exists for this branch (`gh pr view <branch>`), the push updated it. Otherwise open one with `gh pr create`, writing the conventional body to a temporary file and passing it with `--body-file`.
8. Return the PR URL.
9. If this workflow switched branches in an exclusively owned checkout, restore the original branch. When publishing in a separate worktree, leave the source checkout on its original branch, then remove this session's shipped changes from the source checkout so the user does not still see them as local modifications after the PR is open. Restore only files this session created or edited, and only when those files do not contain mixed user/peer edits; if a shipped file has mixed edits, leave it dirty and report that explicitly. Verify unrelated changes remain intact with `git status`, and notify any peers coordinated with in step 1 that publishing is complete.

Never commit, push, or open a PR unless this command was explicitly invoked.
