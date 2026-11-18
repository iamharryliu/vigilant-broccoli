# Web terminal quick reference

Details: [web-terminal-controls.md](./web-terminal-controls.md). Each control is in the bar or the menu, never both.

## Bar

```text
┌─────┬───────┬──────┬─────┬───┬─────┐
│  ☰  │ Enter │ PgUp │ Tab │ ↑ │ Esc │
├─────┼───────┼──────┼─────┼───┼─────┤
│ ^C  │ Paste │ PgDn │  ←  │ ↓ │  →  │
└─────┴───────┴──────┴─────┴───┴─────┘
```

| Button | What it does |
| --- | --- |
| ☰ | Opens the menu. |
| Enter | Submits. |
| PgUp | Scrolls up; hold to repeat. |
| Tab | Autocompletes. |
| ↑ ↓ ← → | Moves through history or the cursor. |
| Esc | Closes menus; interrupts Claude. |
| ^C | Interrupts the running command. |
| Paste | Pastes the clipboard. |
| PgDn | Scrolls down; hold to repeat. |

## Menu (☰)

Search is pinned on every page and searches all of them. **Text size** A− / A+ below it shrinks or enlarges the terminal text and is remembered.

### Claude (built-ins, all run on tap)

| Button | What it does |
| --- | --- |
| `/clear` | New conversation. |
| `/compact` | Summarizes to free context. |
| `/status` | Version, model and account. |
| `/context` | Context window usage. |
| `/model` | Switches model. |
| `/resume` | Reopens a past conversation. |
| `/usage` | Plan usage and limits. |

### Dev (repo skills; some run on tap, some take a prompt)

| Button | What it does | Runs |
| --- | --- | --- |
| `/local-create-pr-claude` | Implements a request in a tmux worktree and opens a PR. | Takes prompt |
| `/local-session-retry-publish` | Retries an authorized push or PR. | On tap |
| `/local-session-status` | Status of agent sessions. | On tap |
| `/local-update-pr-claude` | Applies a change to an existing PR in a tmux worktree. | Takes prompt |
| `/local-update-pr` | Applies a change to an existing PR. | Takes prompt |
