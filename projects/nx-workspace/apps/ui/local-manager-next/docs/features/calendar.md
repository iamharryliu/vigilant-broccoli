# Home Panel Tabs

## Overview

- The home panel uses shared `TabbedView` icon-only tabs with translated accessible labels and titles: Calendar view, Event calendars, Notepad and Quick Links. The existing Weather card and desktop task list stay alongside it, so neither is duplicated in a tab.
- The tab row stays above the panel; content fills the remaining height and scrolls inside the panel.
- A blue Create calendar event button sits to the right of the tabs and stays available on every tab, matching mobile-manager. Both apps use the shared responsive `CreateCalendarEventDialog` from `react-lib-higher-level`, with gallery uploads, camera capture and app-provided voice input; Extract events produces editable drafts that must be confirmed before creation in the connected Google calendar.
- Notepad reuses the desktop `NotepadEditorComponent` and stays mounted to preserve cursor, scroll and realtime state. Quick Links uses the shared `QuickLinksPanel` with desktop links, browser-local favorites (star toggle in rows view, star-prefixed label in badge views); favorites appear in their own group at the top. On desktop (wide viewport, fine pointer) links flagged `embed` open as an in-app `/embed` page (quick links search and Home tab alike; app-route links navigate in the same tab); on narrow or touch viewports they open in a new tab. Its Agentic group (shared with mobile) lists every workflow from the README-derived phases in `@vigilant-broccoli/manager`, labelled by workflow name.
- Calendar view keeps the home page’s Google Calendar agenda embed and its personal, shared, and event calendar sources.
- Each event calendar has an eye / eye-off icon button (“Show in Calendar view”) on its Event calendars card, next to a lock / unlock icon button for public vs. private. Calendars are shown by default; hiding one removes it from the Calendar view embed (the iframe reloads, so its current navigation resets). Colors are assigned before hiding, so hiding one does not recolor the others.
- Event calendars shows calendar management controls and external Google Calendar links, without embedded calendar previews.
- The embed URL, base calendar config, event calendar color cycling and hidden-id storage helpers live in `@harry/personal` (`personal-calendar-embed.ts`) and are shared with `mobile-manager-next`; each app keeps its own localStorage key and hide key (row id here, Google calendar id on mobile).
- Calendar view stays mounted while switching tabs, preserving the iframe’s current navigation and view until leaving or reloading Home.

## Navigation and State

- Calendar view is the default when no tab preference exists.
- The selected tab is saved in browser local storage using `calendar-page-tab`, preserving the existing `personal` and `event-calendars` values. A valid `?tab=` takes precedence over storage; otherwise the stored preference is restored after mount and mirrored into the URL. Calendar view omits `tab`; other values are `event-calendars`, `Notepad` and `Quick Links`. Unrelated query parameters and URL fragments are retained.
- The separate Calendar sidebar and search entries are removed. Existing `/calendar` links redirect to `/`.
- Hidden event calendar ids are saved in browser local storage under `calendar-view-hidden-event-calendars`, so the choice is per browser and new calendars appear by default.
- The Shift+C calendar dialog remains available.

- The dashboard Weather card calculates preparation badges locally using the shared `common-js` calculator; see [thresholds](../../../weather-next/docs/features/preparation-badges/README.md). No preparation API request is made.

## Calendar event bookmarklet

- The Create calendar event dialog shows a "Bookmarklet" link (`CalendarEventBookmarkletLink` in `react-lib-higher-level`, `href` set on the DOM node because React refuses `javascript:` hrefs). Dragging it to the bookmarks bar installs a bookmarklet built from the manager's own `window.location.origin`, so each app's bookmarklet targets itself.
- Clicking it on an event page (Eventbrite, Facebook, Meetup, a venue page, webmail) opens `<origin>/?calendar-event-bookmarklet=1` inside the click, so popup blockers allow it, and posts `{ source, url, title, selection, structuredData, text }` to that origin every 300 ms until acknowledged, giving up after 15 seconds. `structuredData` is every `script[type="application/ld+json"]` (schema.org Event data, capped at 8000 chars) and `text` is `document.body.innerText` capped at 20000 chars, because the page is read by the extraction prompt as-is. It captures the page in the user's own browser, so login-walled and JS-rendered pages work and the server fetch's 6000-char cap does not apply.
- `useCalendarEventBookmarklet` accepts the message only when `event.source === window.opener` and `isCalendarEventBookmarkletMessage` passes, ACKs it (`calendar-event-ack`) to the sender's origin, opens the dialog and prefills the text (title, URL, the selection when present otherwise the page text, structured data). `CalendarInput` then runs Extract once (`initialText` + `autoParse`). Drafts still need the per-event Create click. The query param is removed from the URL on load; closing the dialog clears the prefill.
- The message names live in `CALENDAR_EVENT_BOOKMARKLET` in `@vigilant-broccoli/common-js`; installed bookmarklets embed them, so changing one requires reinstalling.
- A logged-out manager drops the page (login redirect loses the opener and the bookmarklet stops after 15 seconds); sign in, then click the bookmarklet again. Each click opens a new manager tab. The server also fetches up to 3 URLs found in the text, including the page URL when publicly reachable.
