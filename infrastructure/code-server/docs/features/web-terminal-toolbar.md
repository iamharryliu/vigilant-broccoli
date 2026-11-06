# Web terminal toolbar

- The toolbar in `web-terminal/public/index.html` holds key, modifier and `data-text` buttons; `handleButton` in `app.js` sends `data-text` buttons' text with no Enter, so arguments can be added before running.
- After `Paste`, `data-text` buttons come in two groups: Claude Code built-in commands (`/clear`, `/compact`, `/status`, `/context`, `/model`, `/resume`, `/usage`), then repo agent skills. Skill buttons must match a directory name in `setup/dotfiles/agent-skills/`.
- The "All keys" sheet is built from the toolbar buttons, so a new button needs no extra wiring.
