# Calendar Directory

The public, login-free `calendars` home page: three tabs (`CalendarTabs`, modelled on `vb-manager-local-react`'s `HomeCalendarTabs`) of link rows modelled on `vb-manager-next-mobile`'s Event Calendars tab. Event rows link to Google Calendar with Schedule, Week and Month view links and a copy-link control. There is no page header.

## Table of Contents

- [Tabs](#tabs)
- [Embed](#embed)
- [Public endpoint](#public-endpoint)
- [Data](#data)
- [Link construction](#link-construction)
- [Browser storage](#browser-storage)
- [States](#states)
- [Environments](#environments)

## Tabs

- **Calendar View** (default tab) — the Google Calendar embed, see below.
- **Personal Calendars** — static list in `src/lib/calendars.consts.ts`, seeded with Harry's Calendar from `GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL`. Google sharing settings are not managed here.
- **Event Calendars** — `EventCalendars` fetches the VB Express public endpoint on mount (`cache: 'no-store'`) and renders the rows with an eye toggle per row that hides/shows it (the row stays listed with the EyeOff state so it can be shown again; the toggle drives the embed). `useEventCalendars` owns the fetch and hidden set above the tabs so the list and the embed share them.

## Embed

`CalendarView` builds the iframe URL with `buildEventCalendarEmbedUrl` and `PUBLIC_BASE_CALENDAR_CONFIG` from `@harry/personal`. Hidden calendars are filtered out of the URL (colours are assigned before filtering, so the rest keep theirs). The Google calendar id comes from the `src` parameter of each public event calendar URL (`getGoogleCalendarId`), so VB Express returns no extra field. The iframe mounts once the event calendars request settles (success or failure) and the tab is force-mounted (`display: none` and `aria-hidden` when inactive) to avoid reloads. Mode is MONTH on desktop and AGENDA when `isMobileUserAgent` (`common-browser`, shared with `vb-manager-next-mobile`) matches, because the authenticated custom agenda is unavailable here.

**Public bundle:** `PUBLIC_BASE_CALENDAR_CONFIG` uses only `PUBLIC_CALENDAR_SOURCES` (the already-linked personal calendar and Google's public calendars); the private birthdays and shared calendars in `PERSONAL_CALENDAR_SOURCES` must not be used here. The embed only exposes what each calendar's sharing settings already make public.

## Public endpoint

`GET /api/public/event-calendars` in `apps/api/vb-express` (`src/routes/public-event-calendars.ts`, `src/libs/event-calendars.db.ts`) needs no API key and is registered in its own Fastify scope, outside every protected service scope. It selects `id, name, google_calendar_id` with `is_public = true` ordered by `created_at` (the filter is hard-coded server-side; query parameters are ignored) and returns `{ calendars: [{ id, name, url }] }`. Failures return 500 with a generic message and are logged server-side. Every response carries `Cache-Control: no-store`. The Supabase client is created on first request from the shared `SUPABASE_URL` constant in `common-node` (overridable by a `SUPABASE_URL` env var; the fly `[env]` block sets it explicitly) and `SUPABASE_SECRET_KEY` (Vault), so builds, health checks and smoke need neither. CORS for the Pages origins is scoped to the `/api/public/` prefix without credentials in `main.ts`; other routes keep the original allowlist.

## Data

The app is a static bundle: no credential, API key or database snapshot is in it. A failed request affects only the Event Calendars tab.

## Link construction

`https://calendar.google.com/calendar/embed?src=<encodeURIComponent(calendarId)>`, plus `&mode=AGENDA|WEEK|MONTH` for the Schedule, Week and Month links. The copy control copies the base link.

## Browser storage

The tab and hidden-calendar keys live in `src/lib/calendars.consts.ts` and are read and written through `try/catch`, so the page renders (default tab, nothing hidden) when storage is unavailable.

- `calendars-active-tab` — active tab id.
- `calendars-theme` — light/dark override saved by react-lib's `ThemeProvider` when `d` toggles away from `prefers-color-scheme`; `index.html` reads it before first paint. Tailwind uses class-based dark mode so the toggle overrides the system setting.
- `calendars-hidden-event-calendars` — JSON array of hidden event calendar ids, via `readHiddenCalendarIds`/`writeHiddenCalendarIds` from `@harry/personal`. The bundle already imports that lib for the personal calendar id, so this adds no personal data. Hidden ids filter the embed.

## States

Loading, empty (a confirmed `{ calendars: [] }`) and failed load (network error, non-2xx or malformed body) are distinct. A failure is confined to the Event Calendars tab; the embed still renders with the base calendars.

## Environments

`src/environments/environment.ts` holds the staging API base URL (`staging-vb-express.fly.dev`) and the local `http://localhost:3001` for `nx serve`; `environment.production.ts` holds the production one (`api.harryliu.dev`, the canonical production route). `deploy:production` builds with `--configuration=production-env`, which swaps them via a Vite alias. `deploy:preview` uses the staging API too, with PR aliases at `pr-<number>.preview-calendars.pages.dev`; stable and immutable preview origins are allowed only by the public, credential-free GET CORS policy. `nx serve vb-express` needs only `SUPABASE_SECRET_KEY` (fetched from Vault) to serve real rows to `nx serve calendars`; the Supabase URL defaults to the shared constant.
