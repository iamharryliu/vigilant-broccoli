# Calendars

Public, login-free directory of calendars to follow in Google Calendar: a Personal Calendars section (Harry's Calendar) and an Event Calendars section listing every `event_calendars` record the manager has marked public. Each row links to Google Calendar with Schedule, Week and Month view links and a copy-link control. Links only; nothing is embedded.

## Table of Contents

- [Deployment URLs](#deployment-urls)
- [Data](#data)
- [Stack](#stack)

## Deployment URLs

- [calendars.harryliu.dev](https://calendars.harryliu.dev)
- [staging-calendars.pages.dev](https://staging-calendars.pages.dev)
- [production-calendars.pages.dev](https://production-calendars.pages.dev)

## Data

The app is a static bundle. On every page load the browser fetches `GET /api/public/event-calendars` from VB Express (`staging-vb-express.fly.dev` for the staging build, `api.harryliu.dev` for the production build, set by `src/environments/`), so records the manager makes public, renames, removes or makes private show up on the next load without a redeploy. VB Express reads `event_calendars` from the shared Supabase project with its own secret key, filters `is_public = true`, orders by `created_at`, and returns only each record's id, name and Google Calendar URL. No credential, API key or database snapshot is in the bundle.

A failed request renders an error in the Event Calendars section only; the personal calendar stays usable. Feature notes: [docs/features/calendar-directory](./docs/features/calendar-directory/README.md).

## Stack

- Language - TypeScript
- Framework - React
- Build Tool - Vite
- External libs
  - Tailwind CSS
- Internal libs
  - `common-browser`
  - `react-lib`
- Cloud services
  - Cloudflare Pages
  - VB Express (public `GET /api/public/event-calendars`, backed by Supabase)
  - Google Calendar (link targets)
