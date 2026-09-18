---
description: Branch, commit, sync with main, push, and open a PR for files edited in this session.
---

Run the standard git workflow to ship the current changes: branch, commit, push, and open a PR. The rules for staging, branch names, commit types and messages, the PR body, and git safety are the `## Conventions` section of `docs/GIT.md` — read it first and follow it exactly.

1. Check `git status` and `git diff` (staged and unstaged). Stage only the files this session created or edited, per the staging rule; if unsure whether a file was touched this session, leave it unstaged and ask rather than guessing from the diff.
2. Determine the target branch:
   - If the conversation already checked out or discussed a specific non-main branch for these changes (e.g. a PR branch fetched via `gh pr checkout`), commit there directly — do not create a new branch.
   - Otherwise refresh the base first — `git fetch origin main` then `git pull --ff-only origin main` — and create a branch from it named per the convention. If the fast-forward fails, `main` has diverged locally; stop and report rather than merging.
3. Commit the staged changes with a message in the conventional format, ending with the environment's `Co-Authored-By:` trailer.
4. Run `/sync-main` so the PR opens mergeable instead of stale. Resolve conflicts now, while they are small; if one needs the user's judgement, stop and ask.
5. Push: `git push -u origin <branch>` for a new branch, plain `git push` if it already tracks a remote.
6. If an open PR already exists for this branch (`gh pr view <branch>`), the push updated it. Otherwise open one with `gh pr create`, passing the body as a HEREDOC in the conventional format.
7. Return the PR URL.
8. Switch back to the original branch so any other in-progress work there is undisturbed.

Never commit, push, or open a PR unless this command was explicitly invoked.
