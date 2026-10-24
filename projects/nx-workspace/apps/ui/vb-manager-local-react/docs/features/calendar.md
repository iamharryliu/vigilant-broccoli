# Home Calendar Tabs

## Overview

- The home page’s calendar panel contains Calendar view and Event calendars tabs, alongside the existing info card and task list.
- Calendar view keeps the home page’s Google Calendar agenda embed and its personal, shared, and event calendar sources.
- Each event calendar has an eye / eye-off icon button (“Show in Calendar view”) on its Event calendars card, next to a lock / unlock icon button for public vs. private. Calendars are shown by default; hiding one removes it from the Calendar view embed (the iframe reloads, so its current navigation resets). Colors are assigned before hiding, so hiding one does not recolor the others.
- Event calendars shows calendar management controls and external Google Calendar links, without embedded calendar previews.
- The embed URL, base calendar config, event calendar color cycling and hidden-id storage helpers live in `@harry/personal` (`personal-calendar-embed.ts`) and are shared with `vb-manager-next-mobile`; each app keeps its own localStorage key and hide key (row id here, Google calendar id on mobile).
- Calendar view stays mounted while switching tabs, preserving the iframe’s current navigation and view until leaving or reloading Home.

## Navigation and State

- Calendar view is the default when no tab preference exists.
- The selected tab is saved in browser local storage using `calendar-page-tab`, preserving preferences from the former calendar page.
- The separate Calendar sidebar and search entries are removed. Existing `/calendar` links redirect to `/`.
- Hidden event calendar ids are saved in browser local storage under `calendar-view-hidden-event-calendars`, so the choice is per browser and new calendars appear by default.
- The Shift+C calendar dialog remains available.
