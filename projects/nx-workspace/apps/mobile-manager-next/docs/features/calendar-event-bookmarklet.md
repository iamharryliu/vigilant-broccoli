# Calendar Event Bookmarklet

- The shared Create calendar event dialog (`react-lib-higher-level`) includes a "Bookmarklet" link; drag it to the browser's bookmarks bar. The bookmarklet targets the origin it was installed from, so install it from this app for this app. Behavior and limits match [local-manager-next's](../../../ui/local-manager-next/docs/features/calendar.md#calendar-event-bookmarklet).
- `HomeView` calls `useCalendarEventBookmarklet`, which opens the dialog on a message from the tab's opener, prefills the page content and auto-runs Extract; the per-event Create confirmation is unchanged.
- Message contract (`CALENDAR_EVENT_BOOKMARKLET` in `@vigilant-broccoli/common-js`): the bookmarklet opens `/?calendar-event-bookmarklet=1` and posts `{ source: 'calendar-event-bookmarklet', url, title, selection, structuredData: string[], text }`; the receiver replies `calendar-event-ack`. Changing any of these requires reinstalling the bookmarklet.
- Limits: page text is capped at 20000 characters and structured data at 8000. A logged-out manager loses the page after the bookmarklet's 15 second retry window; sign in and click again.
