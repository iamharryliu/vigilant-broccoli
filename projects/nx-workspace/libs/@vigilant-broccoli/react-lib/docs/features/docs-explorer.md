# DocsExplorer

`libs/@vigilant-broccoli/react-lib` — file-tree + search shell for browsing markdown docs. Markdown/checklist rendering and edit mode are layered on top by `react-utility`'s `DocsViewer`.

The `component-library` sandbox has a Utilities > Docs Explorer page that links to docs.harryliu.dev, shows screenshots of it, and renders this file — it doesn't mount the component, which needs a notes tree to browse.

## Exports

- `DocsExplorer` (react-lib) — tree/search shell, content-agnostic
- `DocsNode`, `DocsSearchResult` (react-lib types)
- `DocsViewer`, `FILE_PARAM` (react-utility) — wraps `DocsExplorer` with markdown + checklist view modes and edit mode; `FILE_PARAM` (`'file'`) is the URL query key both consuming apps sync the selected path through

## DocsExplorer Props

- `nodes`, `getContent(path)` — tree + file fetch
- `renderContent(content, navigate, sourcePaths)` — how the selected file(s) render; `sourcePaths` is `[selectedPath]` normally, or every checked path in multi-select mode; `DocsViewer` supplies the markdown/checklist switch here
- `search(query)` — optional; enables the search box
- `urlSync: { get, set, getHash?, setHash? }` — syncs selected file to the URL instead of component state alone; the optional hash pair overrides where heading anchors are read/written (default `window.location.hash`) for hosts whose fragment is already a route — `pages-index`'s Claude Context page stores both inside its `HashRouter` route (`#/claude-context?file=<path>#<heading>`)
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
- Relative markdown links are intercepted and routed through `urlSync`/`onNavigate` instead of a real browser navigation — no consuming app has a per-file route, so a plain `<a href>` navigation would 404 or reload the whole app. In-page anchors and cross-file `#heading` targets go through `urlSync.setHash`/`getHash` when supplied (`DocsViewer` forwards `urlSync` as `hashSync` to `MarkdownViewer`/`ChecklistViewer`), so a `HashRouter` host never has its route replaced by a heading id
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
- Search isn't implemented in these libs — each consuming app supplies its own `search` function. `docs-md` and `pages-index`'s Claude-context viewer both use `createDocsSnapshotSource` (`react-utility`), which fetches every note body once (in-memory per-session cache, in-flight fetch dedup so overlapping searches don't double-fetch) and combines a plain substring content match with a local subsequence filename scorer
- The filename scorer (`docs-snapshot-source.ts`) keeps fuse.js' score convention — 0 is perfect, lower is better — so callers that sort ascending are unaffected. It runs three tiers, each in its own score band so a weaker match can never outrank a stronger one: contiguous substring `[0, 0.2)`, gapped subsequence `[0.2, 0.4)`, then bounded Damerau-Levenshtein `[0.4, 0.6)`. Each tier rejects on its own terms rather than against a shared cutoff, and the two gapped tiers both break ties on coverage — without it `github.md` and `github-actions.md` score identically and the winner is decided by array order
- The fuzzy tier exists because a subsequence scan survives a dropped character for free but nothing else: `githb` matches `github.md`, while `gtihub` (transposition), `gothub` (substitution) and `githhub` (insertion) all fail it. It is gated on a 5-character minimum, one permitted edit per 4 query characters, and the query's first character opening a word in the target (start of name, or after `-_/.`)
- That first-character gate is doing real work: without it `todo` sits one transposition from `tdoo` inside `outdoor.md`, which is precisely the noise fuse.js produced. Typists rarely fumble the first character, so the gate costs almost no recall
- Beating fuse.js on both recall and precision at once is not a better-tuned tradeoff — it is a different cost model. Bitap (`fuse.mjs:450-452`) only carries substitution, insertion and deletion terms from one error level back, so it cannot express a transposition and charges 2 edits for one: measured against `github`, `gothub`/`githb`/`githuub` score `1/6` but `gtihub` scores `2/6`. It matched `gtihub` only because `threshold: 0.4` on a 6-character pattern permits 2 errors — and that same headroom is what let `todo` reach `outdoor.md` and `k8s` reach `shakshuka.md`. Charging 1 for a transposition buys the same typo recall inside a budget less than half as wide
- Measured over the 507-file snapshot, the source file ranks #1 for 54/54 single-typo queries in each of the four classes; fuse.js managed 47/54
