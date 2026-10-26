# Background Tasks

## Overview

- `/background-tasks` page (sidebar entry `SIDEBAR_ROUTE.BACKGROUND_TASKS` with a `ListChecks` icon) lists long-running work with status, start time, duration and an expandable output; it polls every 3 seconds
- Task kinds: `job-application` (runs of the `/job-application` skill started from [Career 2](./career2.md)) and `calendar-sync` (event calendar sync runs)

## API

- `GET /api/background-tasks` merges both sources, newest first
- Job application tasks are rows in the `job_application_runs` table of `~/.vigilant-broccoli/vb-manager.db`, a per-machine SQLite file (`src/lib/job-application-runs.db.ts`, using Node's built-in `node:sqlite`; `better-sqlite3`'s native binding is built for the shell's Node and fails under PM2's interpreter). History survives restarts. Output is the streamed assistant text and tool names, capped at the last 20,000 characters and written about every 2 seconds while running; the last 20 finished runs are kept. The table stores output only, never the pasted posting. Opening the db marks any row still running as failed with an "Interrupted" note, because a PM2 reload or restart kills the run
- Calendar sync tasks are mapped from the durable sync runs (`listSyncRuns`, last 10), with per-calendar results as output and the live progress message of the calendar currently syncing

## Completion toasts

- `useBackgroundTaskNotifications` (called from `(pages)/layout.tsx`) polls `GET /api/background-tasks` every 10 seconds, or every 3 seconds while a task runs, and toasts when a task finishes: success, warning for a partial calendar sync, error for a failure. The toast's View button opens this page unless it is already open
- The first poll only records existing tasks, so opening the app never replays old runs. A task first seen already finished (it ran between polls) still toasts, and so do runs started from the CLI
