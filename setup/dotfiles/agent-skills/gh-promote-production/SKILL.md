---
name: gh-promote-production
description: In vigilant-broccoli, dispatch the manual-promote-production workflow to fast-forward the production branch to the current main commit.
---

Use the current vigilant-broccoli Git root and run `gh` from it. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `gh-promote-production` invocation; it authorizes exactly one workflow dispatch. Make no local file edits.

1. Dispatch it (same as `pnpm gh:actions:promote-production`):

   ```sh
   gh workflow run manual-promote-production.yml --ref main
   ```

2. Find the run with `gh run list --workflow manual-promote-production.yml --limit 1 --json url,createdAt` and report its URL. Do not wait for the run.
3. Tell the user to check the run summary: the job no-ops when `production` already equals `main`, and refuses non-fast-forward promotions. The production deploy follows from the push.
