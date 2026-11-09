---
name: local-create-pr-codex
description: In vigilant-broccoli, research a feature, enhancement or fix request, settle blocking questions with the user, then start Codex in a detached tmux session on a fresh worktree to implement it and ship the PR.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `local-create-pr-codex` invocation; it authorizes one tmux session whose agent implements the request and publishes a PR. Make no edits in this checkout.

Follow the [dispatch contract](../../../../docs/agent-support.md#dispatch-contract) (request, research, stop, ask, prompt), then `local-create-pr-claude` for the worktree, the publishing instruction appended to the prompt, the prompt file and the report, with this session command. Codex's approval mode matches the dev sandbox's `auto`. Set `<effort>` to the contract's chosen reasoning effort, and add `--model <model>` only when the user names a model:

```sh
tmux new-session -d -s vb-pr-<slug> -c "$PWD/.claude/worktrees/<slug>" \
  'codex --sandbox workspace-write --ask-for-approval on-request -c approvals_reviewer=\"auto_review\" -c model_reasoning_effort=\"<effort>\" "$(cat /tmp/vb-local-pr-<slug>.prompt)"'
```

Codex's workspace-write sandbox may block network and `git push`; if the session stops on an approval, the user answers it on attach.
