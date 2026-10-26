# Career 2

## Overview

- `/career2` page (sidebar entry `SIDEBAR_ROUTE.CAREER2` with a `FolderOpen` icon, below Career) is a read-only file explorer over `~/Desktop/Job Applications` on the host running vb-manager-next
- Fills the content area edge to edge (no card). Uses the shared `FileExplorer` from `@vigilant-broccoli/react-lib` ([docs](../../../../../libs/@vigilant-broccoli/react-lib/docs/features/file-explorer.md)), passing `authFetch`, the toast as `onError` and a Modified-descending default sort. UI mirrors antelligence's FileBrowser: up button and breadcrumbs, name search, list/grid toggle, refresh, sortable Name/Size/Modified columns (folders first; newest modified first by default) and a status bar
- Click selects; double-click opens a folder or opens a file in a new tab
- The open folder is kept in `?path=`, so a page reload or browser back/forward stays in place

- A `+` button in the toolbar opens a dialog that takes pasted posting text or an application question (plus an optional posting URL) and runs the `/job-application` skill; Run closes the dialog and shows a toast linking to [Background Tasks](./background-tasks.md), where the run's progress streams. The explorer's refresh button picks up the new folder
- The dialog offers a draggable "Send to Job Applications" bookmarklet. Clicked on a posting (e.g. LinkedIn), it first clicks collapsed "… more" / "Show more" toggles (their text is not in the page until opened), then opens `/career2` and `postMessage`s the page URL and text (whole page, capped at 300k characters) until the dialog acks and prefills. The dialog trims LinkedIn's page chrome with `extractJobPosting`, keeping the page title, the text from "About the job" to the Premium upsell, and the "About the company" block (other sites pass through untrimmed); nothing runs until Run is pressed. It cannot call the API itself since the bearer token lives on the manager's origin
- Only works on the host running vb-manager-next (needs the `claude` CLI, the repo checkout and `~/Desktop`); an application question's answer lands on the host's clipboard, not the browser's

## API

- `GET /api/job-applications?path=<relative>` lists a folder (hidden dotfiles skipped)
- `GET /api/job-applications/file?path=<relative>` returns a file's bytes. The client fetches it with `authFetch` and opens an object URL, since a plain link cannot carry the bearer token
- Both resolve `path` against the root and reject anything that escapes it
- `POST /api/job-applications/run` with `{ url?, text }` starts `claude -p "/job-application …"` from the repo root with an allowlist of tools and returns `{ id }` immediately. One run at a time; a second returns 409
