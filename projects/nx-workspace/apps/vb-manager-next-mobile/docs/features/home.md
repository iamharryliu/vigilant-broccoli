# Home Tabs

- The home page uses the `@vigilant-broccoli/react-lib` `Tabs` pattern (as `HomeCalendarTabs` in `vb-manager-next`) with icon-only Calendar, Event Calendars, Tasks, Notepad and Quick Links tabs (each has an `aria-label` and `title`), sized for touch.
- `TabbedView` (from `@vigilant-broccoli/react-lib-higher-level`) is the generic tab shell: a tab list with an optional actions slot, and per-tab `forceMount`. `HomeView` supplies the tabs.
- The active tab is mirrored in the `?tab=` query param (omitted for Calendar), so `/?tab=Tasks` deep-links. `/task-list` redirects there.
- Tasks renders `GoogleTasksView` with drag and drop disabled, as this is a touch view. It unmounts when inactive and refetches on return. The create-event button is hidden on this tab, which has its own Create tasks button.
- The Calendar tab is force-mounted and hidden with `display: none` plus `aria-hidden`, so the Google Calendar iframe is not reloaded when switching tabs.
- Notepad renders `NotepadEditor` inline and Quick Links renders the react-lib-higher-level `QuickLinksPanel` (the body of `QuickLinksDialog`); neither has a sidebar entry.
- Event Calendars is read-only: a list with per-calendar visibility toggles, with no sync, untracked or edit actions.
- Hidden Google calendar ids are saved in local storage under `vb-manager-hidden-event-calendars`.
- The embed URL, base config, event calendar colors and hidden-id helpers come from `@vigilant-broccoli/personal-common-js` and are shared with `vb-manager-next`.
- The phone agenda (`CalendarAgenda` in `react-lib-higher-level`) draws a red "now" line with a left dot in the Today group, above the first upcoming timed event (below all events when none remain, never above all-day events). The clock refreshes every minute.
- The agenda, Event Calendars list and `TabbedView` live in `@vigilant-broccoli/react-lib-higher-level`, which the component library's Mobile Home entry renders with sample data, so UI edits there change the deployed page. `HomeView` keeps the fetching, auth and Google reconnect.
