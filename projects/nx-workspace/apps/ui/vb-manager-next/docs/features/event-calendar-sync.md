# Event Calendar Sync

## Overview

- `pnpm event-calendars:sync` runs `scripts/sync-event-calendars.ts`, which awaits `runSyncAll` from `sync-runner.ts` to sync every calendar that has sources, sequentially, using the same logic as the UI's `startSync`.
- Results are recorded with `recordSyncResult`. The CLI exits non-zero when any calendar fails; a Facebook login redirect stops the run, prints a sign-in message and exits `3`.
- The CLI owns a PID lockfile (`event-calendars-sync.pid`) in `${VB_MANAGER_DATA_DIR:-$HOME/.vb-manager}` and removes it on exit, and refuses to start (exit 1) while the PID in an existing lockfile is alive.

## Run Records

- Every CLI run and UI-started sync writes an `event_calendar_sync_runs` row: `trigger` (`cli`/`ui`), `status` (`running`/`success`/`partial`/`failed`), `results` (`[{calendar_id, ok, message}]`), `current_calendar_id` and an `updated_at` heartbeat bumped every 5 minutes and per calendar.
- A `running` row with no heartbeat for 30 minutes is reported as failed and stale. Each run first deletes rows older than 30 days.
- `GET /api/event-calendars/sync-runs` returns the 10 most recent runs. The Event Calendars page lists them, marks the calendar a live run is on as syncing (so CLI runs show too) and refetches every 30 seconds (every 3 seconds while a sync runs).
- A calendar with sources gets a Stale badge when `last_synced_at` is missing or older than 36 hours.

## Autosync and Log

- A zsh hook (`setup/dotfiles/zsh/scripts/event_calendars_autosync.zsh`) starts the CLI in the background on a new interactive shell, once per local day (`event-calendars-sync.stamp`), at most once per hour (`event-calendars-sync.attempt`) and not while a live sync holds the lock.
- When the run fails for any reason but an expired Facebook login (exit `3`), the hook deletes the day stamp so the next new shell retries after the hourly window. A login failure keeps the stamp until tomorrow.
- The CLI appends timestamped start, exit and per-calendar lines (written as each calendar finishes, so a crash keeps the calendars completed before it) to `event-calendars-sync.log` in the same directory, truncating it first when it exceeds 1 MB. The hook redirects the background run's full output there too.

## Stale Event Protection

- Stale Facebook events are not deleted when the scrape returned zero events or fewer than half of the events already synced to the calendar. The sync message reports the skip instead.
