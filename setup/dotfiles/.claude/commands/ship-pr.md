---
description: Branch, commit, sync with main, push, and open a PR for files edited in this session.
---

Run the standard git workflow to ship the current changes: branch, commit, push, and open a PR. The rules for staging, branch names, commit types and messages, the PR body, git safety, and shared worktrees are the `## Conventions` and `## Concurrent Claude Sessions` sections of `docs/GIT.md` — read them first and follow them exactly.

1. Check for peer sessions on this working tree with `ListAgents`. If any are listed, `SendMessage` each one what you are about to do and which paths you own, ask it to hold git operations and file writes until you say otherwise, and pass `notify_when_idle: true`. Do not block waiting for a reply, but treat everything below as operating on a shared index and `HEAD`.
2. Check `git status` and `git diff` (staged and unstaged). Read your own diff before staging and drop any comment it adds that restates the code, labels a block with its own code's words, or explains a self-describing config flag — see the comment rule in `CLAUDE.md`'s `## Coding Conventions` and the checklist in `docs/refactor-code-cleanup.md`. Stage only the files this session created or edited, per the staging rule; if unsure whether a file was touched this session, leave it unstaged and ask rather than guessing from the diff. Anything staged that this session did not stage belongs to a peer — leave it alone.
3. Determine the target branch:
   - If the conversation already checked out or discussed a specific non-main branch for these changes (e.g. a PR branch fetched via `gh pr checkout`), commit there directly — do not create a new branch.
   - Otherwise refresh the base first — `git fetch origin main` then `git pull --ff-only origin main` — and create a branch from it named per the convention. If the fast-forward fails, `main` has diverged locally; stop and report rather than merging.
4. Commit with a message in the conventional format, ending with the environment's `Co-Authored-By:` trailer. If anything you do not own is staged, commit by pathspec — `git commit -m "<message>" -- <your paths>` — so a peer's staged work cannot ride along; everything after `--` is read as a filename, so `-m "<message>"` has to come before it.
5. Run `/sync-main` so the PR opens mergeable instead of stale. Resolve conflicts now, while they are small; if one needs the user's judgement, stop and ask. On a shared worktree, skip its stash step — never stash a peer's uncommitted work.
6. Push: `git push -u origin <branch>` for a new branch, plain `git push` if it already tracks a remote.
7. If an open PR already exists for this branch (`gh pr view <branch>`), the push updated it. Otherwise open one with `gh pr create`, passing the body as a HEREDOC in the conventional format.
8. Return the PR URL.
9. Switch back to the original branch so any other in-progress work there is undisturbed, and verify each peer's files survived the round trip (`git status`). If step 1 found peers, `SendMessage` each one that you are done and it can resume, with the PR URL.

Never commit, push, or open a PR unless this command was explicitly invoked.
