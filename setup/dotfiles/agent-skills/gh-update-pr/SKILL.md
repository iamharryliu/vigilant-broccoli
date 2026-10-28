---
name: gh-update-pr
description: In vigilant-broccoli, research a change, CI fix or conflict resolution for an existing pull request locally, settle blocking questions with the user, then dispatch the manual-agentic-pr-update workflow with a self-contained instruction.
---

Use the current vigilant-broccoli Git root and run `gh` from it. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `gh-update-pr` invocation; it authorizes one workflow dispatch. Make no local file edits.

1. Take the PR (number or URL) and instruction from the arguments. Without a PR, use the current branch's (`gh pr view`), else the conversation's most recent PR; ask if ambiguous. Infer the operation: failing checks mean `fix-ci`, merge conflicts mean `resolve-conflicts` (no instruction), otherwise `change` (instruction required).
2. Research read-only: the PR (`gh pr view`, files, checks, mergeability, open review comments), applicable `CONTEXT.md` files and [Doc Map](../../../../CONTEXT.md#doc-map) docs, and overlapping `TODO.md` rows and open PRs (`gh pr list`).
3. Do not dispatch when the PR is closed or merged, or the request is unrelated to the PR's purpose: existing PRs keep their purpose ([pull request scope](../../../../docs/agent-support.md#pull-request-scope)), so suggest `/gh-create-pr` for a follow-up. If the request should not change anything (already done or wrong for the repo), give the reason per the [no-change decisions](../../../../docs/agent-support.md#task-contract).
4. Ask only questions whose answer materially changes scope or outcome, through the harness's structured question tool: at most 4, each with the recommended option first. Record anything with a sensible default as a stated assumption instead. Ask nothing when nothing blocks.
5. The hosted agent sees only the repo and the PR, not this conversation, so write a self-contained instruction: the problem and why it matters, the desired behavior, cited paths and lines, user decisions and constraints, ruled-out options and acceptance checks. Number several review items in priority order. Leave it blank for `resolve-conflicts`.
6. Dispatch directly when no questions were asked; otherwise show the final instruction with the answers and dispatch on the user's confirmation. Add `-f with_ci_logs=true` or `-f model=opus` only when the user asks or the task needs it:

   ```sh
   gh workflow run manual-agentic-pr-update.yml -f pr=<n> -f operation=<op> -f instruction="<instruction>"
   ```

7. Find the run with `gh run list --workflow manual-agentic-pr-update.yml --limit 1 --json url,createdAt` and report its URL with the dispatched instruction. Do not wait for the run.
