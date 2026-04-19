# Calendar

Each home has one calendar. Accessed at `/homes/[id]/calendar`.

## Routes

- `/calendar` — redirects to primary home's calendar
- `/homes/[id]/calendar` — home calendar page

## Features

- Month / week / day views
- Click to create events (drag to select range)
- Click event to edit or delete
- Drag events to reschedule
- Per-event color picker
- All-day event support

## Architecture

- `CalendarView.tsx` — FullCalendar adapter, swap this to change UI lib
- `CalendarEventForm.tsx` — create/edit form, lib-agnostic
- `homes/[id]/calendar/page.tsx` — data fetching and state
- `api/calendar/events/route.ts` — CRUD backed by Supabase

## Data

- Table: `calendar_events` (see `supabase/migrations/20260419000012_create_calendar_events.sql`)
- `google_event_id` column reserved for future Google Calendar sync
- RLS: users can only access events for homes they own or are accepted members of
