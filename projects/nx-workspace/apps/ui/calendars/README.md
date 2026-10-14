# Calendars

Public, login-free calendar page with three tabs: a Calendar View tab (default) that embeds Google Calendar, a Personal Calendars tab (Harry's Calendar) and an Event Calendars tab listing every `event_calendars` record the manager has marked public. Event rows link to Google Calendar with Schedule, Week and Month view links and a copy-link control, and have a show/hide toggle that adds or removes that calendar from the embed. On mobile browsers the embed uses Google's AGENDA mode, since the authenticated custom agenda is not available on this public site. The active tab and hidden event calendars are remembered in this browser's `localStorage`.

## Table of Contents

- [Deployment URLs](#deployment-urls)
- [Embed](#embed)
- [Data](#data)
- [Stack](#stack)

## Deployment URLs

- [calendar.harryliu.dev](https://calendar.harryliu.dev)
- [staging-calendars.pages.dev](https://staging-calendars.pages.dev)
- [production-calendars.pages.dev](https://production-calendars.pages.dev)

## Embed

The Calendar View tab renders one Google Calendar `iframe` built by `buildEventCalendarEmbedUrl` from `personal-common-js` with `PUBLIC_BASE_CALENDAR_CONFIG` (Harry's calendar plus Google's public holiday and moon-phase calendars, with event calendar colours cycled). Hiding an event calendar in the Event Calendars tab removes it from the embed URL, so the iframe re-renders without it. The tab is force-mounted, so switching tabs does not reload the iframe. Desktop uses MONTH mode; mobile browsers (`isMobileUserAgent` from `common-browser`) use AGENDA. The embed only exposes what each calendar's Google sharing settings already make public; private calendars (birthdays, shared family calendars) are deliberately excluded from the public config.

## Data

The app is a static bundle. On every page load the browser fetches `GET /api/public/event-calendars` from VB Express (`staging-vb-express.fly.dev` for the staging build, `api.harryliu.dev` for the production build, set by `src/environments/`), so records the manager makes public, renames, removes or makes private show up on the next load without a redeploy. VB Express reads `event_calendars` from the shared Supabase project with its own secret key, filters `is_public = true`, orders by `created_at`, and returns only each record's id, name and Google Calendar URL; the embed derives each Google calendar id from the URL's `src` parameter, so the endpoint is unchanged. No credential, API key or database snapshot is in the bundle.

A failed request renders an error in the Event Calendars tab only; the personal calendar stays usable. Feature notes: [docs/features/calendar-directory](./docs/features/calendar-directory/README.md).

## Stack

- Language - TypeScript
- Framework - React
- Build Tool - Vite
- External libs
  - Tailwind CSS
- Internal libs
  - `common-browser`
  - `personal-common-js`
  - `react-lib`
- Cloud services
  - Cloudflare Pages
  - VB Express (public `GET /api/public/event-calendars`, backed by Supabase)
  - Google Calendar (embed and link targets)
