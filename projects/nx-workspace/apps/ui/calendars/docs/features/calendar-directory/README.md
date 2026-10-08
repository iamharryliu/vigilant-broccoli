# Calendar Directory

The `calendars` home page: two sections of link rows modelled on `vb-manager-next-mobile`'s `/event-calendars` page.

## Table of Contents

- [Sections](#sections)
- [Public endpoint](#public-endpoint)
- [Link construction](#link-construction)
- [States](#states)
- [Environments](#environments)

## Sections

- **Personal Calendars** — static list in `src/lib/calendars.consts.ts`, seeded with Harry's Calendar from `GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL`. Google sharing settings are not managed here.
- **Event Calendars** — `EventCalendars` fetches the VB Express public endpoint on mount (`cache: 'no-store'`) and renders the rows.

## Public endpoint

`GET /api/public/event-calendars` in `apps/api/vb-express` (`src/routes/public-event-calendars.ts`, `src/libs/event-calendars.db.ts`) needs no API key and is registered in its own Fastify scope, outside every protected service scope. It selects `id, name, google_calendar_id` with `is_public = true` ordered by `created_at` (the filter is hard-coded server-side; query parameters are ignored) and returns `{ calendars: [{ id, name, url }] }`. Failures return 500 with a generic message and are logged server-side. Every response carries `Cache-Control: no-store`. The Supabase client is created on first request from `SUPABASE_URL` (fly `[env]`) and `SUPABASE_SECRET_KEY` (Vault), so builds, health checks and smoke need neither. CORS for the Pages origins is scoped to the `/api/public/` prefix without credentials in `main.ts`; other routes keep the original allowlist.

## Link construction

`https://calendar.google.com/calendar/embed?src=<encodeURIComponent(calendarId)>`, plus `&mode=AGENDA|WEEK|MONTH` for the Schedule, Week and Month links. The copy control copies the base link.

## States

Loading, empty (a confirmed `{ calendars: [] }`) and failed load (network error, non-2xx or malformed body) are distinct. A failure is confined to the Event Calendars section.

## Environments

`src/environments/environment.ts` holds the staging API base URL (and the local `http://localhost:3001` for `nx serve`); `environment.production.ts` holds the production one. `deploy:production` builds with `--configuration=production-env`, which swaps them via a Vite alias. Run VB Express locally with `SUPABASE_URL` and `SUPABASE_SECRET_KEY` set to see real rows in `nx serve calendars`.
