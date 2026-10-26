# Sample

## Overview

- `/sample` page (sidebar entry `SIDEBAR_ROUTE.SAMPLE` with a `ClipboardList` icon, below Career 2) lists the folders under `~/Desktop/Job Applications` with `CRUDItemList` (read-only cards), newest date first and, within a date, most recently created first
- Each item is titled `YYYY-MM-DD HH:MM:SS <company and role>`: the date and role come from the folder name (`2026-10-22-Capgemini-Senior-Backend-Developer`) and the time is when the folder was created (local, 24-hour); a folder without a date prefix keeps its name with its modified date
- Clicking a card expands it (`CRUDItemList`'s `ExpandedComponent`: an animated panel below the header row, so the ellipsis stays put; the chevron rotates) and reads its folder: the left column lists the card's actions as icon buttons and the right has Posting and Gaps tabs: Posting renders the job description parsed into a `Role · Company` heading, About the job and About the company (text that does not fit the LinkedIn shape stays under About the job), and Gaps lists the bullets of the `*-gaps-*.txt` the skill saves (posting requirements the career records do not support; `- None` means no gaps, and older applications show "No gaps document saved"). The same actions are in the card's ellipsis menu
- Actions: View resume and View cover letter render the PDF in a dialog, and the cover letter dialog has a Copy button (top right) that copies the plain-text `*-cover-letter-*.txt`; Open in Finder runs `open` on the folder through `POST /api/job-applications/open` (path confined to the Job Applications root)
- Copy strips leftover `**` markers, so letters written before the plain-text rule copy clean. Folders created before the posting was saved report "No posting saved"

## API

- Reuses `GET /api/job-applications` and `GET /api/job-applications/file` from [Career 2](./career2.md); only the Finder action adds a route

## New job application

- The page header's New job application button opens the dialog (moved from [Career 2](./career2.md)); the bookmarklet opens `/sample` and prefills it
- When a job application run finishes, its toast's View application action opens `/sample?expand=latest`, which expands the newest card (reloading the page if already there). The "Job application started" toast and failed runs still link to Background Tasks
