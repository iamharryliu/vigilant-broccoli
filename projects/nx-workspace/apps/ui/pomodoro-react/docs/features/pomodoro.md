# Pomodoro

`use-pomodoro.ts` owns the timer. The countdown is computed from an end timestamp on a 250 ms interval, so background-tab throttling doesn't drift it. Completing a focus session increments the counter; every `longBreakEvery` completions (default 4) the next break is long. Sessions end paused so the next one starts on demand. Skip advances without sound or notification; Reset restores the current session's full duration.

Settings (durations, long-break interval, sound, notifications) persist under `pomodoro:v1`; invalid stored values fall back to defaults and failed writes keep the in-memory values with a notice. The counter and running timer are not persisted. Duration edits apply immediately while paused. The remaining time and mode show in `document.title`. Completion plays a Web Audio beep and, once permission is granted, a `Notification`.
