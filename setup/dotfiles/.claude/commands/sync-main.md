Bring the current branch up to date with `origin/main` so work doesn't drift into a stale branch or a pile-up of merge conflicts.

1. Fetch without touching the working tree: `git fetch origin main`.
2. Report the drift both ways so the size of the gap is explicit:
   `git rev-list --left-right --count origin/main...HEAD` — the left number is commits on `main` this branch is missing, the right is commits this branch has that `main` doesn't.
   - Zero on the left: already current, stop here and say so.
3. If the working tree is dirty (`git status --porcelain` is non-empty), stash first with `git stash push -u -m "sync-main"` and remember to pop it at the end. Never sync over uncommitted work.
4. Integrate, based on where HEAD is:
   - On `main`: `git pull --ff-only origin main`. If that fails, `main` has local commits that never went through a PR — stop and report it rather than merging; that state needs a human decision.
   - On a feature branch: `git merge --no-edit origin/main`. Merge, never rebase — this repo forbids force-pushing (see `docs/GIT.md`), and a rebase of an already-pushed branch can only be published with one. PRs land as squash merges, so these merge commits never reach `main`'s history.
5. If the merge conflicts, resolve it now while the conflict is small — that is the entire point of syncing often. Resolve each file, `git add` it, then `git commit --no-edit`. If a conflict genuinely needs the user's judgement (both sides changed the same logic in incompatible ways), leave the merge in progress and ask rather than guessing.
6. Pop the stash if step 3 created one, and resolve any conflicts it raises.
7. Report: commits pulled in, files that conflicted (if any), and whether the branch is now clean relative to `origin/main`.

Do not push, and do not open or update a PR — syncing is a local operation. `/ship-pr` handles publishing.
