---
name: gh-create-pr
description: In vigilant-broccoli, research a feature, enhancement or fix request locally, settle blocking questions with the user, then dispatch the manual-agentic-pr-create workflow with a self-contained prompt.
---

Use the current vigilant-broccoli Git root and run `gh` from it. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `gh-create-pr` invocation; it authorizes one workflow dispatch. Make no local file edits.

1. Take the request from the arguments. Without arguments, use the change this conversation most recently identified as worth building; if none stands out, ask.
2. Research read-only: the affected code and existing patterns, applicable `CONTEXT.md` files and [Doc Map](../../../../CONTEXT.md#doc-map) docs, and overlapping `TODO.md` rows and open PRs (`gh pr list`).
3. If the request should not be built (already done, out of this repo's scope or wrong for it), do not dispatch; give the reason per the [no-change decisions](../../../../docs/agent-support.md#task-contract). If an existing TODO row covers it, name the row ID and suggest dispatching it by ID instead. If the request only drops existing TODO rows without resolving them, dispatch one run per ID with the prompt exactly `Remove TODO.md row <id>. Reason: <reason>` ([TODO references](../../../../docs/agent-support.md#pull-request-scope)); free text that deletes rows fails the runner's undeclared-removal check. Together they count as the one authorized dispatch.
4. Ask only questions whose answer materially changes scope or outcome (which app/lib owns it, public vs private lib, new app vs pages-index page, a new public URL, a breaking change), through the harness's structured question tool: at most 4, each with the recommended option first. Record anything with a sensible default as a stated assumption instead. Ask nothing when nothing blocks.
5. The hosted agent sees only the repo, not this conversation, so write a self-contained prompt as `gh-create-todo` step 2 does: the problem and why it matters, the desired behavior, cited paths and lines, existing patterns to follow, user decisions and constraints, ruled-out options and acceptance checks. Describe large tasks as ordered mergeable increments per [pull request scope](../../../../docs/agent-support.md#pull-request-scope).
6. Dispatch directly when no questions were asked; otherwise show the final prompt with the answers and dispatch on the user's confirmation. Add `-f agent=codex` or `-f model=opus` only when the user asks:

   ```sh
   gh workflow run manual-agentic-pr-create.yml -f prompt="<prompt>"
   ```

7. Find the run with `gh run list --workflow manual-agentic-pr-create.yml --limit 1 --json url,createdAt` and report its URL with the dispatched prompt. Do not wait for the run.
