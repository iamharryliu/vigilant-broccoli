# Career 2

## Overview

- `/career2` page (sidebar entry `SIDEBAR_ROUTE.CAREER2` with a `FolderOpen` icon, below Career) is a read-only file explorer over `~/Desktop/Job Applications` on the host running vb-manager-next
- Fills the content area edge to edge (no card). Uses the shared `FileExplorer` from `@vigilant-broccoli/react-lib` ([docs](../../../../../libs/@vigilant-broccoli/react-lib/docs/features/file-explorer.md)), passing `authFetch`, the toast as `onError` and a Modified-descending default sort. UI mirrors antelligence's FileBrowser: up button and breadcrumbs, name search, list/grid toggle, refresh, sortable Name/Size/Modified columns (folders first; newest modified first by default) and a status bar
- Click selects; double-click opens a folder or opens a file in a new tab
- The open folder is kept in `?path=`, so a page reload or browser back/forward stays in place

- New job applications are made in job-applications-next, embedded on the [Job Hunt](./job-hunt.md) page. Nothing in the UI calls `POST /api/job-applications/run` any more; its runs still show in [Background Tasks](./background-tasks.md)
- Only works on the host running vb-manager-next (needs the `claude` CLI, the repo checkout and `~/Desktop`); an application question's answer lands on the host's clipboard, not the browser's

## API

- `GET /api/job-applications?path=<relative>` lists a folder (hidden dotfiles skipped)
- `GET /api/job-applications/file?path=<relative>` returns a file's bytes. The client fetches it with `authFetch` and opens an object URL, since a plain link cannot carry the bearer token
- Both resolve `path` against the root and reject anything that escapes it
- `POST /api/job-applications/run` with `{ url?, text }` starts `claude -p "/job-application …"` from `projects/nx-workspace` and returns `{ id }` immediately. The posting is untrusted text, so the tool allowlist is Read, Edit, Write, `mkdir`, `ls`, `date`, `pbcopy`/`pbpaste` and only the skill's three scripts (`npx tsx apps/ui/vb-manager-next/scripts/{check-resume,generate-resume-pdf,generate-cover-letter-pdf}.ts`); a bare `npx`/`pnpm` rule would let an injected posting run any package, and anything unlisted is denied in headless mode. The prompt tells the agent it is already in that directory so it runs the scripts without `cd`. One run at a time; a second returns 409
