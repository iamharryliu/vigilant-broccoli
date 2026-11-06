# Web terminal toolbar

- The horizontal bar in `web-terminal/public/index.html` shows only `☰`, `Enter`, `PgUp`, `PgDn`, `Esc`, `^C` and `Paste`, in that order. There is no `Tab` button.
- Arrows, `Home`, `End`, `Ctrl`, `Alt`, `^D`, `^Z` and the slash-command buttons carry `data-sheet-only`: `style.css` hides them from the bar, but they stay in the markup so the "All keys" sheet can clone them.
- `handleButton` in `app.js` sends `data-text` buttons' text with no Enter, so arguments can be added before running. After `Paste`, they come in two groups: Claude Code built-in commands (`/clear`, `/compact`, `/status`, `/context`, `/model`, `/resume`, `/usage`), then repo agent skills. Skill buttons must match a directory name in `setup/dotfiles/agent-skills/`.
- The "All keys" sheet is built from the toolbar buttons (except `☰`), so a new button needs no extra wiring; add `data-sheet-only` to keep it off the bar.
