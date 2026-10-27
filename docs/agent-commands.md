# Agent Commands

Custom agent commands from `setup/dotfiles/agent-skills/<name>/SKILL.md`, invoked as `/name` in Claude and `$name` in Codex. See [agent-support.md](./agent-support.md) for the conventions behind them.

## Commands

| Command | Phase | Description |
| --- | --- | --- |
| `docs-spell-check` | Maintain | Spell-check the current directory with the spellcheck CLI. |
| `gh-create-pr` | Develop | Research a request locally, settle blocking questions, then dispatch the `manual-agentic-pr-create` workflow. |
| `gh-create-todo` | Plan | Dispatch the `manual-agentic-pr-create-todo` workflow to open a PR adding a `TODO.md` row for the request or conversation. |
| `gh-promote-production` | Release | Dispatch the `manual-promote-production` workflow to fast-forward `production` to the current `main` commit. |
| `local-create-pr-claude` | Develop | Research a request, settle blocking questions, then start Claude in a detached tmux session on a fresh worktree to implement it and ship the PR. |
| `local-create-pr-codex` | Develop | Research a request, settle blocking questions, then start Codex in a detached tmux session on a fresh worktree to implement it and ship the PR. |
| `local-docker-create-pr-claude` | Develop | Research a request locally, settle blocking questions, then start a background local Docker sandbox solve with Claude. |
| `local-docker-create-pr-codex` | Develop | Research a request locally, settle blocking questions, then start a background local Docker sandbox solve with Codex. |
| `local-pr-create` | Develop | Implement TODO items or a free-text task using repo conventions and verify the result. |
| `local-pr-create-audit` | Maintain | Remove or rewrite documentation that describes legacy implementations or makes claims the current codebase no longer backs. |
| `local-pr-create-comment-audit` | Maintain | Enforce the comment rule repo-wide by removing redundant comments and generator scaffolding while keeping non-obvious ones. |
| `local-pr-create-context-audit` | Maintain | Slim agent guidance by removing duplicated rules and incident narrative without losing any rule, workaround, recovery step or error. |
| `local-pr-create-free-tier-audit` | Maintain | Verify every cloud service has a Free Tier section and a free-tier-infrastructure.md row, correcting entries only from verifiable sources. |
| `local-pr-create-inventory-audit` | Maintain | Find missing or stale rows in the fork identity and secret inventories and fix them without touching secret values. |
| `local-pr-create-prune` | Maintain | Find dead code, unused dependencies and stale or broken documentation, and remove only what has verifiably zero references. |
| `local-pr-create-rnd` | Plan | Research a question and write an R&D note under `docs/rnd/` from the R&D template. |
| `local-pr-create-todo` | Plan | Refine a request using repo research into an actionable task prompt and add one well-cited row to `TODO.md`. |
| `local-pr-create-todo-audit` | Maintain | Verify every `TODO.md` row against the tree, remove resolved entries and correct drifted references without adding tasks. |
| `local-pr-create-url-audit` | Maintain | Verify public URLs have synchronized Upptime entries, pages-index cards and quick links, and published Docker images their card and README row. |
| `local-pr-update` | Develop | Apply a requested change to an existing PR branch and verify its cumulative result. |
| `local-pr-update-fix-ci` | Develop | Diagnose a PR's failing CI checks from their logs and fix the branch so the checks pass. |
| `local-pr-update-resolve-conflicts` | Develop | Merge `origin/main` into a PR branch and resolve conflicts while preserving both sides. |
| `ship-pr` | Develop | Branch, commit, sync with main, push and open a PR for files edited in the session. |
| `update-feature-documentation` | Develop | Create or update the slim `docs/features` note under the affected app for the session's changes. |
| `update-readmes` | Maintain | Refresh every `README.md` against the [README pattern](./app-readme-pattern.md) and the current code. |
