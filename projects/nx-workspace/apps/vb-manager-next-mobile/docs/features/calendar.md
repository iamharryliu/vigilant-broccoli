# Calendar Tabs

- The calendar page uses the `@vigilant-broccoli/react-lib` `Tabs` pattern (as `HomeCalendarTabs` in `vb-manager-next`) with icon-only Calendar, Event Calendars and Tasks tabs (each has an `aria-label` and `title`), sized for touch.
- `TabbedView` (`tabbed-view.tsx`) is the generic tab shell: a tab list with an optional actions slot, and per-tab `forceMount`. `MyCalendarView` supplies the tabs.
- The active tab is mirrored in the `?tab=` query param (omitted for Calendar), so `/?tab=Tasks` deep-links. `/task-list` redirects there.
- Tasks renders `GoogleTasksView` with drag and drop disabled, as this is a touch view. It unmounts when inactive and refetches on return. The create-event button is hidden on this tab, which has its own Create tasks button.
- The Calendar tab is force-mounted and hidden with `display: none` plus `aria-hidden`, so the Google Calendar iframe is not reloaded when switching tabs.
- Event Calendars is read-only: a list with per-calendar visibility toggles, with no sync, untracked or edit actions.
- Hidden Google calendar ids are saved in local storage under `vb-manager-hidden-event-calendars`.
- The embed URL, base config, event calendar colors and hidden-id helpers come from `@vigilant-broccoli/personal-common-js` and are shared with `vb-manager-next`.
