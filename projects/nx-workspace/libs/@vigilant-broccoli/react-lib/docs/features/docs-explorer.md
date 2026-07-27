# DocsExplorer

`libs/@vigilant-broccoli/react-lib` — file-tree + search shell for browsing markdown docs. Markdown/checklist rendering and edit mode are layered on top by `react-utility`'s `DocsViewer`.

## Exports

- `DocsExplorer` (react-lib) — tree/search shell, content-agnostic
- `DocsNode`, `DocsSearchResult` (react-lib types)
- `DocsViewer`, `FILE_PARAM` (react-utility) — wraps `DocsExplorer` with markdown + checklist view modes and edit mode; `FILE_PARAM` (`'file'`) is the URL query key both consuming apps sync the selected path through

## DocsExplorer Props

- `nodes`, `getContent(path)` — tree + file fetch
- `renderContent(content, navigate, sourcePaths)` — how the selected file(s) render; `sourcePaths` is `[selectedPath]` normally, or every checked path in multi-select mode; `DocsViewer` supplies the markdown/checklist switch here
- `search(query)` — optional; enables the search box
- `urlSync: { get, set }` — syncs selected file to the URL instead of component state alone
- `viewModes`, `currentViewMode`, `onViewModeChange` — populate the content-pane dropdown
- `onEdit` — adds an Edit item to the content-pane dropdown
- `renderGraph(navigate)` — optional; enables the sidebar graph toggle and renders its result in the content pane (see [note-graph.md](./note-graph.md))
- `sidebarTitle`, `searchPlaceholder`, `emptyMessage` — copy overrides

## DocsViewer Props

- `getStructure`, `getContent`, `search` — same contracts as DocsExplorer
- `saveContent(path, content)` — optional; its presence alone enables the Edit action
- `getGraph()` — optional; supplies the note graph and enables the graph toggle (see [note-graph.md](./note-graph.md))
- `urlSync` — forwarded to DocsExplorer

## Behaviour

- View mode (`markdown` / `checklist`) persists in `localStorage` (`docs-md:view-mode`) independent of which file is open; defaults to markdown
- Checklist view renders the full document exactly like markdown view — only top-level lists become checkboxes; tables, prose, code, headings pass through unchanged
- Checkbox state persists per file (`localStorage`, key `docs-checklist:<path>`), keyed by structural position (`list<N>.<itemIndex>`, nested via `.l.`) — not content, so state can go stale if list ordering changes; in aggregate mode (below) the key is a composite of every selected path joined with `|`, so the same set of files always shares one saved state
- All rendered HTML (both view modes) is sanitized with DOMPurify before injection
- Relative markdown links are intercepted and routed through `urlSync`/`onNavigate` instead of a real browser navigation — neither app has a per-file route, so a plain `<a href>` navigation would 404 or reload the whole app
- Headings get GitHub-style slug `id`s (`markdown-config.ts`'s `createHeadingRenderer`, via `github-slugger`) so `[Section](#section)`-style TOC/cross-file anchors resolve — `marked` v5+ no longer assigns heading ids on its own
- `createHeadingRenderer()` builds a fresh renderer+slugger per parse call rather than a shared/global one — `marked`'s own heading-id extensions track dedup state in module scope, which breaks under React Strict Mode's double-invoked effects/memos (two overlapping parses for the same content stomp on each other's dedup reset) and under any real overlapping parse (e.g. switching files before the previous parse settles)
- Both apps' `urlSync.set()` must preserve `window.location.hash` when rebuilding the URL — it's easy to accidentally drop the hash (e.g. rebuilding the URL from just the query params) since `DocsExplorer` calls `urlSync.set()` on initial mount too, even when just echoing back the file it already read from the URL
- Cross-file links with a section anchor (`./file.md#section`) carry the hash through: `resolveNoteLink` keeps it on the resolved target, and `selectFile` only writes `window.location.hash` when the caller actually supplied one — plain path selections (tree click, search result, initial URL sync) leave the hash alone, since the initial-mount sync always calls `selectFile` with a bare path and would otherwise clobber a hash that was already correctly in the URL from a direct link
- Known gap: selecting a _different_ file via the tree or search doesn't clear a leftover hash from the previous file — harmless (no matching heading means `scrollToUrlHash` no-ops) but the stale fragment stays visible in the URL until something overwrites it
- `scrollToUrlHash()` (`note-links.ts`) runs after content renders in both viewers — the browser's native scroll-to-fragment only fires around initial page load, which is well before this SPA's async-fetched content (and its heading ids) exist in the DOM
- Checking multiple files in the tree (checkbox next to each file) switches the content pane to an aggregate view: their contents join with `\n\n---\n\n`, with a mode toggle (in the dropdown) for whether to keep every file's headings as-is, drop just each file's leading `#` title, or strip all headings — `saveContent`/edit is disabled in this mode
- Note-link resolution in aggregate mode is imprecise: `MarkdownViewer` resolves relative links against only the first selected file's directory (wrong for links belonging to a later file in a different directory), and `ChecklistViewer` gets the composite `aggregate:path1|path2` string as its "path", which isn't a real path at all — relative link clicks there resolve incorrectly
- Edit mode swaps content for a plain `<textarea>` (no live preview); content-pane dropdown also has "Copy markdown" (always) and "Back to files" (mobile only)
- Search is debounced 300ms; Arrow keys move focus between the search box and result list, Escape clears the query
- Mobile collapses to two full-width panels (sidebar/content) toggled by a back button — no side-by-side layout below `md:`
- Search isn't implemented in these libs — each consuming app supplies its own `search` function:
  - `docs-md` app: fetches every note body once (8-way concurrency cap, in-memory per-session cache, in-flight fetch dedup so overlapping searches don't double-fetch), plain substring content match + `fuse.js` fuzzy filename match
  - `vb-manager-next`: server route re-reads local disk (`~/vigilant-broccoli/notes`) on every request, `fuse.js` fuzzy match for both filename and content — its content match has no `ignoreLocation`, so (unlike docs-md) it can miss matches far into long documents
