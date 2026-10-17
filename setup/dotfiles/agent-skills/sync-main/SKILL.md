---
name: sync-main
description: In vigilant-broccoli, merge origin/main into the current branch (or fast-forward main) without pushing.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Sync locally under `docs/git-workflow.md`; do not push or update PRs.

1. `git fetch origin main`, then `git rev-list --left-right --count origin/main...HEAD` (missing/additional commits). Stop if none are missing.
2. Establish checkout ownership before integration. If dirty, stash with `git stash push -u -m "sync-main"` only in an exclusively owned checkout; shared or uncertain trees require a clean, exclusive checkout. Do not commit pending work to clean it.
3. On main, `git pull --ff-only origin main`; report failure without merging. On a feature branch, `git merge --no-edit origin/main`; never rebase.
4. Resolve conflicts, stage only owned resolutions and `git commit --no-edit`. Leave the merge in progress and ask if intent requires user judgment. Restore this operation's stash and resolve any resulting conflicts.
5. Report incoming commits, conflicted files and remaining drift/working-tree changes.
