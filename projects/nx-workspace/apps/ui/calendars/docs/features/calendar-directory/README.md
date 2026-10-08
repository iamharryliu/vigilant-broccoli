# Calendar Directory

The `calendars` home page: two sections of link rows modelled on `vb-manager-next-mobile`'s `/event-calendars` page.

## Table of Contents

- [Sections](#sections)
- [Link construction](#link-construction)
- [States](#states)

## Sections

- **Personal Calendars** — static list in `src/lib/calendars.consts.ts`, seeded with Harry's Calendar from `GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL`. Google sharing settings are not managed here.
- **Event Calendars** — `loadPublicEventCalendars` (`src/lib/event-calendars.ts`) reads `id, name, google_calendar_id` for `is_public = true` rows ordered by `created_at`. The page is `force-dynamic` and the section streams inside `Suspense`.

## Link construction

`https://calendar.google.com/calendar/embed?src=<encodeURIComponent(calendarId)>`, plus `&mode=AGENDA|WEEK|MONTH` for the Schedule, Week and Month links. The copy control copies the base link.

## States

Loading (Suspense fallback), empty (no public records) and failed load (query error or missing credentials) are distinct. A failure is confined to the Event Calendars section.
