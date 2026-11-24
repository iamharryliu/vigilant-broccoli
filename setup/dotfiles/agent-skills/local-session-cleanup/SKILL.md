---
name: local-session-cleanup
description: In vigilant-broccoli, remove worktrees, local branches and tmux sessions of merged or closed PRs under .claude/worktrees, then fast-forward main when safe.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `local-session-cleanup` invocation. It deletes only what a finished PR left behind; anything unfinished, dirty or ambiguous is reported and kept.

1. `git fetch origin main --prune` and `git worktree list --porcelain`. Candidates are worktrees under `.claude/worktrees/` only; never the main checkout or worktrees elsewhere.
2. For each candidate branch, run `gh pr list --head <branch> --state all --json number,url,state`. Without a PR, or with an open or draft one, keep it. A failed lookup is not evidence of a merged PR.
3. Remove a candidate only when its PR is `MERGED` or `CLOSED` and `git --no-optional-locks -C <worktree> status --short` is empty. For `CLOSED` unmerged PRs also require `git -C <worktree> cherry origin/main <branch>` to show no unpushed commits (`+` lines) beyond what the PR carried; otherwise keep and report it. Dirty trees are never forced.
4. Remove in order: `tmux kill-session -t '=vb-pr-<slug>'` if that exact session exists, `git worktree remove <worktree>` (never `--force`), then `git branch -D <branch>` (squash merges leave the branch unmerged by Git's definition, so `-d` fails), and `git push origin --delete <branch>` only if the remote branch still exists. Finish with `git worktree prune`.
5. Fast-forward main only in an exclusive checkout that is on `main` with a clean tree: `git pull --ff-only origin main`. On another branch or with uncommitted work, do not switch, stash or pull; report that main is behind by `git rev-list --count main..origin/main`. Report divergence instead of merging.

Report one bullet per candidate: removed, or kept with the reason (open PR, no PR, dirty, unpushed commits, lookup failed), plus the main sync result.
