# Background Tasks

## Overview

- `/background-tasks` page (sidebar entry `SIDEBAR_ROUTE.BACKGROUND_TASKS` with a `ListChecks` icon) lists long-running work with status, start time, duration and an expandable output; it polls every 3 seconds
- Task kinds: `calendar-sync` (event calendar sync runs)

## API

- `GET /api/background-tasks` lists the tasks newest first
- Calendar sync tasks are mapped from the durable sync runs (`listSyncRuns`, last 10), with per-calendar results as output and the live progress message of the calendar currently syncing

## Completion toasts

- `useBackgroundTaskNotifications` (called from `(pages)/layout.tsx`) polls `GET /api/background-tasks` every 10 seconds, or every 3 seconds while a task runs, and toasts when a task finishes: success, warning for a partial calendar sync, error for a failure. The toast's View button opens this page unless it is already open
- The first poll only records existing tasks, so opening the app never replays old runs. A task first seen already finished (it ran between polls) still toasts, and so do runs started from the CLI
