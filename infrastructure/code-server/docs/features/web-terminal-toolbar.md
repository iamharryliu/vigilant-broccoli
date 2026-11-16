# Web terminal toolbar

User-facing key reference: [web-terminal-controls.md](./web-terminal-controls.md); update it when buttons change.

- Every control lives in exactly one place, the bar or the menu, never both. Every button carries `data-bar-only` or `data-sheet-only`; a new one needs exactly one.
- The horizontal bar in `web-terminal/public/index.html` shows only `☰`, `Enter`, `Tab`, `PgUp`, `PgDn`, `Esc`, `^C`, `Paste` and the arrows, in that order. All carry `data-bar-only`, so `app.js` leaves them out of the sheet.
- The slash-command buttons carry `data-sheet-only`: `style.css` hides them from the bar, but they stay in the markup so the menu can clone them.
- Menu buttons carry `data-page` (`claude` or `dev`, matching the tabs in `#keys-tabs`) and `data-desc`, the description shown under the label and matched by search.
- `handleButton` in `app.js` sends `data-text` buttons' text. With `data-submit` (the `claude` page's built-in commands: `/clear`, `/compact`, `/status`, `/context`, `/model`, `/resume`, `/usage`) it follows with Enter as a separate write after `SUBMIT_DELAY_MS`; without it no Enter is sent, so arguments can be added before running (the `claude` page's `-claude` skills and the `dev` page's repo agent skills). Skill buttons must match a directory name in `setup/dotfiles/agent-skills/`.
- The menu is built from the toolbar buttons (except `☰` and `data-bar-only` ones), so a new menu button needs no extra wiring beyond `data-page` and `data-desc`.
- `#keys-search` is pinned on every page. A query lists matches from all pages by label and description and deselects the tabs; no query shows the active page. Choosing a tab, or closing the menu, clears the query.
- The sheet is full screen (`#keys-panel` fills `#keys-sheet`, safe-area insets respected) with `#keys-header` and `#keys-tabs` pinned and `#keys-list` scrolling. It closes via ✕, Escape or choosing an item. The sheet's `pointerdown` and `contextmenu` handlers skip the search field so it can take focus.
- Opening the sheet blurs the terminal to dismiss the soft keyboard. Closing restores focus only if the terminal was focused before opening; keys sent while it stays open never reopen the keyboard.
