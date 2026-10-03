# Codex

## Table of Contents

- [Commands](#commands)
- [config.toml](#configtoml)
- [Sandbox](#sandbox)

## Commands

```sh
codex # open the terminal UI in the current directory
codex "Explain this project" # start a chat with an initial prompt
codex -C ~/code/app "Fix the bug" # use another workspace root
codex -i screenshot.png "Recreate this UI" # attach an image to the first prompt
codex --search "Check current docs, then update this integration" # enable live web search

# SESSION CONTROL
codex resume --last # continue the most recent interactive session
codex fork --last "Try another approach" # branch the latest session into a new chat

# NON-INTERACTIVE
codex exec "Fix the failing lint rule" # run Codex without opening the TUI
codex exec --json "Run tests and report failures" # stream events as JSONL for scripts

# REVIEW
codex review --uncommitted # review staged, unstaged, and untracked changes
codex review --base main # review current branch against main

# COMMON SLASH COMMANDS
/status # inspect chat id, model, workspace, context, and rate limits
/permissions # adjust sandbox and approval boundaries mid-session
/model # choose the active model for the chat
/plan # toggle plan mode before implementation
/review # review local changes or compare against a base branch
/compact # compress a long chat context
```

## config.toml

Codex reads user-level defaults from `~/.codex/config.toml`; trusted projects can layer `.codex/config.toml`, and `-c 'key=value'` applies a one-run override.

| Key                                      | Values                                               | What it controls                                                                                                                         |
| ---------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `approval_policy`                        | `on-request`, `never`, or granular policy            | Whether actions outside the current sandbox pause for approval or fail/continue according to policy.                                     |
| `model`                                  | model slug                                           | Default model for new sessions.                                                                                                          |
| `model_reasoning_effort`                 | `low`, `medium`, `high`, `xhigh`, etc.               | Reasoning level requested from the selected model; supported values depend on the model and client.                                      |
| `project_doc_fallback_filenames`         | array of filenames                                   | Extra instruction filenames to try when a directory has no `AGENTS.md`.                                                                  |
| `project_doc_max_bytes`                  | number                                               | Byte limit for project instructions loaded from `AGENTS.md` and fallback files; raise above the 32 KiB default if guidance is truncated. |
| `project_root_markers`                   | array of filenames                                   | Filenames Codex checks while walking parent directories to find the project root.                                                        |
| `projects.<path>.trust_level`            | `trusted` or `untrusted`                             | Marks a project as trusted or untrusted; untrusted projects skip project-local `.codex/` layers, hooks, and rules.                       |
| `sandbox_mode`                           | `read-only`, `workspace-write`, `danger-full-access` | Filesystem and network sandbox policy for shell commands.                                                                                |
| `sandbox_workspace_write.network_access` | boolean                                              | Allows outbound network for shell commands when `sandbox_mode = "workspace-write"`.                                                      |
| `sandbox_workspace_write.writable_roots` | array of absolute paths                              | Extra writable locations when `sandbox_mode = "workspace-write"`.                                                                        |
| `service_tier`                           | `fast` or another advertised tier                    | Preferred service tier for new turns.                                                                                                    |
| `tools.web_search`                       | boolean or config object                             | Enables and configures Codex web search, including optional context size, allowed domains, and location hints.                           |

## Sandbox

Sandboxing sets the boundary for shell commands Codex runs. Approval policy is separate: the sandbox decides what is allowed directly, while `approval_policy` decides whether Codex can ask before crossing that boundary.

| Mode                 | Use when                          | Behavior                                                                                                            |
| -------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `read-only`          | Browsing, planning, or auditing.  | Codex can inspect the workspace; edits and other side effects need approval or fail, depending on policy.           |
| `workspace-write`    | Normal local coding.              | Codex can edit the workspace and temp directories; writes outside writable roots and network usually need approval. |
| `danger-full-access` | Disposable isolated environments. | Sandbox restrictions are disabled; use only when another VM/container boundary is already protecting the host.      |

Use `/permissions` to change the sandbox during an interactive session and `/status` to see the active workspace roots.
