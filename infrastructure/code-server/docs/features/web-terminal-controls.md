# Web terminal controls

Human-readable guide to the buttons on `shell.harryliu.dev`. One-page summary: [web-terminal-quick-reference.md](./web-terminal-quick-reference.md). Implementation notes live in [web-terminal-toolbar.md](./web-terminal-toolbar.md).

## Table of Contents

- [Always-visible bar](#always-visible-bar)
- [Menu](#menu)
  - [Claude page](#claude-page)
  - [Dev page](#dev-page)

## Always-visible bar

| Button | Sends | What it does |
| --- | --- | --- |
| ☰ | n/a | Opens the full-screen menu. |
| Enter | `↵` | Submits the command or Claude prompt. |
| Tab | `⇥` | Autocompletes a path or command; in Claude Code, accepts a suggestion. |
| PgUp / PgDn | Page Up / Page Down | Scrolls through output; hold to repeat. Dismisses the soft keyboard for more rows. |
| Esc | `Esc` | Closes menus and prompts; in Claude Code, interrupts the current response (press twice to rewind to an earlier message). |
| ^C | Ctrl+C | Interrupts the running command, or cancels the current Claude turn. |
| Paste | n/a | Pastes the clipboard; falls back to a text prompt if clipboard access is denied. |
| ↑ ↓ ← → | Arrow keys | Moves through history or the cursor; in Claude Code, recalls earlier prompts. |

## Menu

The search field at the top is on every page and searches all pages by name and description. Tabs switch pages: Claude and Dev.

Each control is in the bar or the menu, never both. The menu closes with ✕, `Esc`, or by choosing an item.

The **Text size** row under the search field shrinks (A−) or enlarges (A+) the terminal text by 1px, from 8px to 20px, without closing the menu. Smaller text fits more columns and rows. The size is remembered in this browser; until it is changed, phones start at 11px and wider screens at 14px.

### Claude page

Buttons type the command and press Enter.

| Command | What it does |
| --- | --- |
| `/clear` | Starts a fresh conversation with empty context. |
| `/compact` | Summarizes the conversation to free context. |
| `/context` | Shows how much of the context window is used. |
| `/model` | Switches the model. |
| `/resume` | Reopens a previous conversation. |
| `/status` | Shows version, model and account state. |
| `/usage` | Shows plan usage and limits. |

### Dev page

Buttons type the command without pressing Enter, so arguments can be added first.

| Command | What it does | Runs on tap |
| --- | --- | --- |
| `/local-create-pr-claude` | Researches a request, then runs Claude in a detached tmux session on a fresh worktree to implement it and open a PR. | No |
| `/local-session-retry-publish` | Tells idle agents to retry an authorized push or PR after credentials were refreshed. | No |
| `/local-session-status` | Read-only status of agent sessions and jobs started in this conversation. | No |
| `/local-update-pr-claude` | Researches a change to an existing PR, then runs Claude in a detached tmux session on a worktree of its branch and pushes to the PR. | No |
| `/local-update-pr` | Applies a requested change to an existing PR branch and verifies it. | No |
