# Web terminal toolbar

- The horizontal bar in `web-terminal/public/index.html` shows only `☰`, `Enter`, `PgUp`, `PgDn`, `Esc`, `^C`, `Paste` and the arrows, in that order. There is no `Tab` button.
- `Home`, `End`, `Ctrl`, `Alt`, `^D`, `^Z` and the slash-command buttons carry `data-sheet-only`: `style.css` hides them from the bar, but they stay in the markup so the "All keys" sheet can clone them.
- `Enter`, `PgUp`, `PgDn` and the arrows carry `data-bar-only`, so `app.js` leaves them out of the sheet.
- `handleButton` in `app.js` sends `data-text` buttons' text with no Enter, so arguments can be added before running. After `Paste`, they come in two groups: Claude Code built-in commands (`/clear`, `/compact`, `/status`, `/context`, `/model`, `/resume`, `/usage`), then repo agent skills. Skill buttons must match a directory name in `setup/dotfiles/agent-skills/`.
- The "All keys" sheet is built from the toolbar buttons (except `☰` and `data-bar-only` ones), so a new button needs no extra wiring.
