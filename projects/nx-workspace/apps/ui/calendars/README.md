# Calendars

Public, login-free directory of calendars to follow in Google Calendar: a Personal Calendars section (Harry's Calendar) and an Event Calendars section listing every `event_calendars` record the manager has marked public. Each row links to Google Calendar with Schedule, Week and Month view links and a copy-link control. Links only; nothing is embedded.

## Table of Contents

- [Deployment URLs](#deployment-urls)
- [Data](#data)
- [Stack](#stack)

## Deployment URLs

- [calendars.harryliu.dev](https://calendars.harryliu.dev)
- [staging-calendars.vercel.app](https://staging-calendars.vercel.app)

## Data

The home page is rendered per request (`force-dynamic`), so records the manager makes public, renames, removes or makes private show up on the next load without a redeploy. The server reads `event_calendars` from the shared Supabase project with the secret key (`SUPABASE_SECRET_KEY`, server-side only; the table is not readable with the public key), filters `is_public = true`, orders by `created_at`, and sends the client only each record's id, name and derived Google Calendar URL. Scraping sources and sync metadata never leave the server.

A failed read renders an error in the Event Calendars section only; the personal calendar stays usable. Feature notes: [docs/features/calendar-directory](./docs/features/calendar-directory/README.md).

## Stack

- Language - TypeScript
- Framework - Next.js (React)
- Build Tool - Next.js
- External libs
  - Tailwind CSS
  - Supabase JS
- Internal libs
  - `common-browser`
  - `common-node`
  - `react-lib`
- Cloud services
  - Supabase (`event_calendars`)
  - Google Calendar (link targets)
  - Vercel
