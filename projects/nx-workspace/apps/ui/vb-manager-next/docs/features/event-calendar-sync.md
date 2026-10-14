# Event Calendar Sync

## Overview

- `pnpm event-calendars:sync` runs `scripts/sync-event-calendars.ts`, which awaits `runSyncAll` from `sync-runner.ts` to sync every calendar that has sources, sequentially, using the same logic as the UI's `startSync`.
- Results are recorded with `recordSyncResult`. The CLI exits non-zero when any calendar fails; a Facebook login redirect stops the run and prints a sign-in message.
- The CLI owns a PID lockfile (`event-calendars-sync.pid`) in `${VB_MANAGER_DATA_DIR:-$HOME/.vb-manager}` and removes it on exit, and refuses to start (exit 1) while the PID in an existing lockfile is alive.
- A zsh hook (`setup/dotfiles/zsh/scripts/event_calendars_autosync.zsh`) starts the CLI silently in the background on a new interactive shell, once per local day (`event-calendars-sync.stamp`) and not while a live sync holds the lock. The stamp is written when an attempt starts, so a failed login is not retried until tomorrow.

## Stale Event Protection

- Stale Facebook events are not deleted when the scrape returned zero events or fewer than half of the events already synced to the calendar. The sync message reports the skip instead.
