---
name: serve-local
description: In vigilant-broccoli, check out a pull request (or keep the current branch) in the main checkout and serve its app locally after freeing the port.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `serve-local` invocation; it kills processes. Arguments: optional `PR_NUMBER`, optional `--port N` / `port=N` (default 3000). Work in the main checkout, not a new worktree, so the user can view it from there. Never commit, push, stash or discard changes. Uncommitted files already in the checkout are the user's: leave them untouched, and stop and report if a checkout would overwrite them.

1. With `PR_NUMBER`, run `gh pr view <n> --json headRefName,state,files` and refuse closed or merged PRs. If `git worktree list` shows the head branch checked out elsewhere, remove that worktree only when `git -C <wt> status --short` is clean and it matches the remote; otherwise stop and report. Then `git fetch origin main <headRefName>`, `git checkout <headRefName>` and `git merge --no-ff origin/main` (never rebase); on conflicts stop and report instead of resolving. Without `PR_NUMBER`, skip checkout and merge and serve the branch already checked out.
2. Pick the app from the PR's changed files under `projects/nx-workspace/apps/<app>/` (ask if several); without a PR, from the app the conversation most recently discussed (ask if ambiguous). Find its serve target in the app's `project.json` and prefer `pnpm nx serve <app>` as its README documents. If that target runs database migrations (hearth's `serve` runs `scripts/migrate.ts`), say so in the report and offer `serve:local` as the migration-free alternative.
3. Free the port: list listeners with `lsof -nP -iTCP:<port> -sTCP:LISTEN`, show each PID and command, send SIGTERM, then SIGKILL if still listening after a moment, and confirm the port is free. If the serve command cannot take a port, make it land on the requested one (`-p`/`--port` or `PORT`).
4. Start the server detached in the background, logging to the session scratchpad (`/tmp` only when the harness has none), and poll with `curl` until the port returns 2xx/3xx or a bounded timeout passes. Never wait on the server in the foreground.
5. Report the URL, branch, whether `origin/main` was merged (a local merge commit, not pushed), any killed process, the log path and whether migrations ran.
