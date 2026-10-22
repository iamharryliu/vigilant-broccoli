# Pomodoro

- `PomodoroEngine` owns the timer and must be mounted once; `PomodoroUtilityContent` renders it and talks to it through window events, so the content can mount anywhere (dialogs, pages, the component sandbox).
- Consumed by `pomodoro-react` (pomodoro.harryliu.dev) and the `react-sandbox` utility group.

## Modes

- Focus and break alternate, each with configurable minutes (1-180).
- Duration edits are disabled while running and apply immediately to a session that has not been started or paused part-way.
- A session ending beeps until dismissed, then dismissing starts the next session. Skip and Reset are silent.

## Stage sequence

- The badge row shows the other stage faded on either side of the current stage (e.g. break, focus, break).

## Settings dialog

- The gear Settings button opens a dialog holding only the Focus and Break minute inputs; the main view shows the timer, stage sequence and controls.

## Persistence

- Settings (minutes) persist under `vb-pomodoro-settings`; leftover long-break fields are ignored on load.
- Timer state (mode, remaining time, running or paused, completed count) persists under `vb-pomodoro-timer` with an absolute end timestamp while running, so a reload resumes with the correct remaining time. A stored long-break mode falls back to focus. A session that ended while the page was closed is finished silently on load: the counter advances and the next session waits paused.

## Notifications

- The first Start click requests browser notification permission when it is still undecided; a notification is sent at stage end when granted. Nothing happens when denied or unsupported.
