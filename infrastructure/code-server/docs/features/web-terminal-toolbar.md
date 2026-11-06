# Web terminal toolbar

- The horizontal bar in `web-terminal/public/index.html` shows only `☰`, `Enter`, `PgUp`, `PgDn`, `Esc`, `^C` and `Paste`, in that order. There are no slash-command or `Tab` buttons.
- Arrows, `Home`, `End`, `Ctrl`, `Alt`, `^D` and `^Z` carry `data-sheet-only`: `style.css` hides them from the bar, but they stay in the markup so the "All keys" sheet can clone them.
- The "All keys" sheet is built from the toolbar buttons (except `☰`), so a new button needs no extra wiring; add `data-sheet-only` to keep it off the bar.
