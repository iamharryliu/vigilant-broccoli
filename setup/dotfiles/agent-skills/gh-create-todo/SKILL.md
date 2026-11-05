---
name: gh-create-todo
description: In vigilant-broccoli, dispatch the manual-agentic-pr-create-todo workflow to open a PR adding a TODO.md row for the given request or, without one, the improvement this conversation identified.
---

Use the current vigilant-broccoli Git root and run `gh` from it. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `gh-create-todo` invocation; it authorizes one workflow dispatch. Do not edit `TODO.md` or any other file locally.

1. Take the request from the arguments. Without arguments, use the change or improvement this conversation most recently identified as worth doing; if none stands out, ask.
2. The hosted agent sees only the repo, not this conversation, so write a self-contained description: the problem and why it matters, the desired behavior, the concrete paths and quoted snippets or symbols already found here (never line numbers), decisions or constraints the user stated, and anything ruled out. Do not repeat what `agentic-pr-create-todo` research would find on its own.
3. Dispatch it, adding `-f model=opus` only when the user asks:

   ```sh
   gh workflow run manual-agentic-pr-create-todo.yml -f description="<description>"
   ```

4. Find the run with `gh run list --workflow manual-agentic-pr-create-todo.yml --limit 1 --json url,createdAt` and report its URL with the dispatched description. Do not wait for the run; it opens the PR, or reports why no row was added, in its job summary.
