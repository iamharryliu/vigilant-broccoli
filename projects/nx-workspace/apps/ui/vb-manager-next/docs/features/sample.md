# Sample

## Overview

- `/sample` page (sidebar entry `SIDEBAR_ROUTE.SAMPLE` with a `ClipboardList` icon, below Career 2) lists the folders under `~/Desktop/Job Applications` as a collapsible list, newest date first and, within a date, most recently created first
- Each item is titled `YYYY-MM-DD HH:MM:SS <company and role>`: the date and role come from the folder name (`2026-10-22-Capgemini-Senior-Backend-Developer`) and the time is when the folder was created (local, 24-hour); a folder without a date prefix keeps its name with its modified date
- Expanding an item reads the folder: the saved job posting (the `*-job-posting-*.txt` file, shown inline) and every file with a View button and, for `.txt`/`.md`/`.json`, a Copy button that puts the text on the clipboard
- Copy strips leftover `**` markers, so letters written before the plain-text rule copy clean. Folders created before the posting was saved show "No posting saved"

## API

- Reuses `GET /api/job-applications` and `GET /api/job-applications/file` from [Career 2](./career2.md); no new routes
