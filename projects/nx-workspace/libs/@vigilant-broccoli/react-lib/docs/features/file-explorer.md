# File Explorer

- Read-only file browser over any backend that lists folders and serves file bytes: up button and breadcrumbs, name search, list/grid toggle, refresh, sortable Name/Size/Modified columns (folders first) and a status bar. Click selects; double-click opens a folder or opens a file in a new tab.

## Usage

- Point `listEndpoint` at a route returning `{ entries: FileEntry[] }` for `?path=<relative>` and `fileEndpoint` at one returning the file's bytes. `FileEntry` and `FILE_ENTRY_KIND` come from `@vigilant-broccoli/common-js` so the route and the component share one contract.
- `fetcher` (default `fetch`) lets the caller supply an authenticated fetch; files are opened through an object URL because a plain link cannot carry a bearer token. `onError` receives open-file failures, `defaultSort` sets the initial order (default Name ascending) and `toolbarAction` adds a node to the toolbar.
- The open folder is kept in the `?path=` query param so reloads and back/forward stay in place.

## Constraints

- Path validation (rejecting `..` and absolute paths) belongs to the caller's routes; the component only passes the relative path through.
- Styling is Tailwind classes. A consumer must include this package's source or published files in its Tailwind content paths.
