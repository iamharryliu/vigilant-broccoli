# Home Panel Tabs

## Overview

- The home panel uses shared `TabbedView` icon-only tabs with translated accessible labels and titles: Calendar view, Event calendars, Notepad and Quick Links. The existing Weather card and desktop task list stay alongside it, so neither is duplicated in a tab.
- The tab row stays above the panel; content fills the remaining height and scrolls inside the panel.
- Notepad reuses the desktop `NotepadEditorComponent` and stays mounted to preserve cursor, scroll and realtime state. Quick Links uses the shared `QuickLinksPanel` with desktop links. Its Agentic group (shared with mobile) lists every workflow from the README-derived phases in `@vigilant-broccoli/manager`, labelled by workflow name.
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
