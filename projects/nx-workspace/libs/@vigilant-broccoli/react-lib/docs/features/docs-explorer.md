# DocsExplorer

`libs/@vigilant-broccoli/react-lib` — file-tree + search shell for browsing markdown docs. Markdown/checklist rendering and edit mode are layered on top by `react-utility`'s `DocsViewer`.

## Exports

- `DocsExplorer` (react-lib) — tree/search shell, content-agnostic
- `DocsNode`, `DocsSearchResult` (react-lib types)
- `DocsViewer`, `FILE_PARAM` (react-utility) — wraps `DocsExplorer` with markdown + checklist view modes and edit mode; `FILE_PARAM` (`'file'`) is the URL query key both consuming apps sync the selected path through

## DocsExplorer Props

- `nodes`, `getContent(path)` — tree + file fetch
- `renderContent(content, navigate)` — how the selected file renders; `DocsViewer` supplies the markdown/checklist switch here
- `search(query)` — optional; enables the search box
- `urlSync: { get, set }` — syncs selected file to the URL instead of component state alone
- `viewModes`, `currentViewMode`, `onViewModeChange` — populate the content-pane dropdown
- `onEdit` — adds an Edit item to the content-pane dropdown
- `sidebarTitle`, `searchPlaceholder`, `emptyMessage` — copy overrides

## DocsViewer Props

- `getStructure`, `getContent`, `search` — same contracts as DocsExplorer
- `saveContent(path, content)` — optional; its presence alone enables the Edit action
- `urlSync` — forwarded to DocsExplorer

## Behaviour

- View mode (`markdown` / `checklist`) persists in `localStorage` (`docs-md:view-mode`) independent of which file is open; defaults to markdown
- Checklist view renders the full document exactly like markdown view — only top-level lists become checkboxes; tables, prose, code, headings pass through unchanged
- Checkbox state persists per file (`localStorage`, key `docs-checklist:<path>`), keyed by structural position (`list<N>.<itemIndex>`, nested via `.l.`) — not content, so state can go stale if list ordering changes
- All rendered HTML (both view modes) is sanitized with DOMPurify before injection
- Relative markdown links are intercepted and routed through `urlSync`/`onNavigate` instead of a real browser navigation — neither app has a per-file route, so a plain `<a href>` navigation would 404 or reload the whole app
- Edit mode swaps content for a plain `<textarea>` (no live preview); content-pane dropdown also has "Copy markdown" (always) and "Back to files" (mobile only)
- Search is debounced 300ms; Arrow keys move focus between the search box and result list, Escape clears the query
- Mobile collapses to two full-width panels (sidebar/content) toggled by a back button — no side-by-side layout below `md:`
- Search isn't implemented in these libs — each consuming app supplies its own `search` function:
  - `docs-md` app: fetches every note body once (8-way concurrency cap, in-memory per-session cache, in-flight fetch dedup so overlapping searches don't double-fetch), plain substring content match + `fuse.js` fuzzy filename match
  - `vb-manager-next`: server route re-reads local disk (`~/vigilant-broccoli/notes`) on every request, `fuse.js` fuzzy match for both filename and content — its content match has no `ignoreLocation`, so (unlike docs-md) it can miss matches far into long documents
