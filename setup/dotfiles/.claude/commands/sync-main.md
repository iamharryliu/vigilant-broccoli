---
description: Merge origin/main into the current branch (or fast-forward main) without pushing.
---

Bring the current branch up to date with `origin/main` so work doesn't drift into a stale branch or a pile-up of merge conflicts.

1. Fetch without touching the working tree: `git fetch origin main`.
2. Report the drift both ways with `git rev-list --left-right --count origin/main...HEAD` (left: commits this branch is missing; right: commits it adds). Zero on the left: already current, stop here and say so.
3. If the working tree is dirty (`git status --porcelain` is non-empty), stash first with `git stash push -u -m "sync-main"` and remember to pop it at the end. Never sync over uncommitted work. First check `ListAgents`: the stash is shared, so on a worktree with peer sessions attached `git stash push -u` takes their in-flight work too — there, commit your own paths instead and sync a clean branch (see `## Concurrent Claude Sessions` in `docs/GIT.md`).
4. Integrate, based on where HEAD is:
   - On `main`: `git pull --ff-only origin main`. If that fails, `main` has local commits that never went through a PR — stop and report rather than merging.
   - On a feature branch: `git merge --no-edit origin/main`. Merge, never rebase — `docs/GIT.md` explains why.
5. If the merge conflicts, resolve each file now while the conflict is small, `git add` it, then `git commit --no-edit`. If a conflict genuinely needs the user's judgement, leave the merge in progress and ask rather than guessing.
6. Pop the stash if step 3 created one, and resolve any conflicts it raises.
7. Report: commits pulled in, files that conflicted (if any), and whether the branch is now clean relative to `origin/main`.

Do not push, and do not open or update a PR — syncing is a local operation. `/ship-pr` handles publishing.
