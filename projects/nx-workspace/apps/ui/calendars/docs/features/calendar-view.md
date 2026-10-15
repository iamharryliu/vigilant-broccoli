# Calendar View

The Calendar View tab: one Google Calendar embed combining the personal and public event calendars.

## Table of Contents

- [Embed](#embed)

## Embed

The Calendar View tab renders one Google Calendar `iframe` built by `buildEventCalendarEmbedUrl` from `personal-common-js` with `PUBLIC_BASE_CALENDAR_CONFIG` (Harry's calendar plus Google's public holiday and moon-phase calendars, with event calendar colours cycled). Hiding an event calendar in the Event Calendars tab removes it from the embed URL, so the iframe re-renders without it. The tab is force-mounted, so switching tabs does not reload the iframe. Desktop uses MONTH mode; mobile browsers (`isMobileUserAgent` from `common-browser`) use AGENDA. The embed only exposes what each calendar's Google sharing settings already make public; private calendars (birthdays, shared family calendars) are deliberately excluded from the public config.

Related: [calendar directory](./calendar-directory/README.md) covers the tabs, public endpoint, storage and environments.
