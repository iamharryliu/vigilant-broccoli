# Calendar Tabs

- The calendar page uses the `@vigilant-broccoli/react-lib` `Tabs` pattern (as `HomeCalendarTabs` in `vb-manager-next`) with Calendar and Event Calendars tabs, sized for touch.
- The Calendar tab is force-mounted and hidden with `display: none` plus `aria-hidden`, so the Google Calendar iframe is not reloaded when switching tabs.
- Event Calendars is read-only: a list with per-calendar visibility toggles, with no sync, untracked or edit actions.
- Hidden Google calendar ids are saved in local storage under `vb-manager-hidden-event-calendars`.
- The embed URL, base config, event calendar colors and hidden-id helpers come from `@vigilant-broccoli/personal-common-js` and are shared with `vb-manager-next`.
