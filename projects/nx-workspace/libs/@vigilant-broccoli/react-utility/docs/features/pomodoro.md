# Pomodoro

- `PomodoroEngine` owns the timer and must be mounted once; `PomodoroUtilityContent` renders it and talks to it through window events, so the content can mount anywhere (dialogs, pages, the component sandbox).
- Consumed by `pomodoro-react` (pomodoro.harryliu.dev) and the `react-sandbox` utility group.

## Modes

- Focus, short break and long break, each with configurable minutes (1-180). Every `longBreakEvery` completed focus sessions (default 4, max 12) the next break is long.
- Duration edits are disabled while running and apply immediately to a session that has not been started or paused part-way.
- A session ending plays the beep loop (timed 15 s or persistent alert mode) and, with notifications on, shows a browser `Notification`; dismissing or the timed alert expiring starts the next session. Skip and Reset are silent.

## Stage sequence

- The badge row shows the previous and next stage faded on either side of the current stage, derived from the completed count and `longBreakEvery` (e.g. previous break, current focus, next long break). The previous slot is empty before the first focus session completes; after a break the neighbours are both focus.

## Settings dialog

- The gear Settings button opens a dialog holding the Persistent Alert and Browser notifications toggles and the Focus, Short break, Long break and Long break every inputs; the main view only shows the timer, stage sequence and controls.

## Persistence

- Settings (minutes, long-break interval, alert mode, notifications) persist under `vb-pomodoro-settings`.
- Timer state (mode, remaining time, running or paused, completed count) persists under `vb-pomodoro-timer` with an absolute end timestamp while running, so a reload resumes with the correct remaining time. A session that ended while the page was closed is finished silently on load: the counter advances and the next session waits paused.

## Notifications

- Enabling the switch requests browser permission; it is disabled with a hint when permission is denied or unsupported.
