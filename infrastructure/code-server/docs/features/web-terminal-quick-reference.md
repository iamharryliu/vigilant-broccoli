# Web terminal quick reference

Details: [web-terminal-controls.md](./web-terminal-controls.md). Each control is in the bar or the menu, never both.

## Bar

| Button | What it does |
| --- | --- |
| ☰ | Opens the menu. |
| Enter | Submits. |
| Tab | Autocompletes. |
| PgUp | Scrolls up; hold to repeat. |
| PgDn | Scrolls down; hold to repeat. |
| Esc | Closes menus; interrupts Claude. |
| ^C | Interrupts the running command. |
| Paste | Pastes the clipboard. |
| ↑ ↓ ← → | Moves through history or the cursor. |

## Menu (☰)

Search is pinned on every page and searches all of them. **Text size** A− / A+ below it shrinks or enlarges the terminal text and is remembered.

### Claude (built-ins run on tap; `-claude` skills type only)

| Button | What it does |
| --- | --- |
| `/clear` | New conversation. |
| `/compact` | Summarizes to free context. |
| `/status` | Version, model and account. |
| `/context` | Context window usage. |
| `/model` | Switches model. |
| `/resume` | Reopens a past conversation. |
| `/usage` | Plan usage and limits. |
| `/local-create-pr-claude` | Implements a request in a tmux worktree and opens a PR. |
| `/local-update-pr-claude` | Applies a change to an existing PR in a tmux worktree. |

### Dev (types only, add arguments)

| Button | What it does |
| --- | --- |
| `/local-session-status` | Status of agent sessions. |
| `/local-session-retry-publish` | Retries an authorized push or PR. |
| `/local-update-pr` | Applies a change to an existing PR. |
