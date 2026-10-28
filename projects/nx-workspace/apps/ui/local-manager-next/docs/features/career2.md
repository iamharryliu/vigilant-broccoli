# Career 2

## Overview

- `/career2` page (sidebar entry `SIDEBAR_ROUTE.CAREER2` with a `FolderOpen` icon, below Career) is a read-only file explorer over `~/Desktop/Job Applications` on the host running local-manager-next
- Fills the content area edge to edge (no card). Uses the shared `FileExplorer` from `@vigilant-broccoli/react-lib` ([docs](../../../../../libs/@vigilant-broccoli/react-lib/docs/features/file-explorer.md)), passing `authFetch`, the toast as `onError` and a Modified-descending default sort. UI mirrors antelligence's FileBrowser: up button and breadcrumbs, name search, list/grid toggle, refresh, sortable Name/Size/Modified columns (folders first; newest modified first by default) and a status bar
- Click selects; double-click opens a folder or opens a file in a new tab
- The open folder is kept in `?path=`, so a page reload or browser back/forward stays in place

- New job applications are made in job-hunt-next, embedded on the [Job Hunt](./job-hunt.md) page

## API

- `GET /api/job-applications?path=<relative>` lists a folder (hidden dotfiles skipped)
- `GET /api/job-applications/file?path=<relative>` returns a file's bytes. The client fetches it with `authFetch` and opens an object URL, since a plain link cannot carry the bearer token
- Both resolve `path` against the root and reject anything that escapes it
