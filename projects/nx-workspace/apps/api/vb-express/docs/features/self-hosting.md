# Self-Hosting

Run vb-express from the `iamharryliu/vb-express` image, and what each route group needs.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Route Dependencies](#route-dependencies)
- [Auth Database](#auth-database)
- [Supabase Table](#supabase-table)
- [Nuances](#nuances)

## Run from Registry

The `deploy-container` target in `project.json` builds and pushes the image (`linux/amd64`). It starts with no third-party credentials; routes whose dependencies are unset fail when called.

```
docker run --platform linux/amd64 \
  -p 3000:3000 \
  -e DATABASE_URL=postgres://<user>:<password>@<host>:5432/<db> \
  -e BETTER_AUTH_SECRET=<random 32+ characters> \
  -e VB_EXPRESS_API_KEY=<key> \
  iamharryliu/vb-express:latest
```

The container is stateless and runs as a non-root user; users, sessions and API keys live in Postgres (see [Auth Database](#auth-database)).

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `BETTER_AUTH_SECRET` | Session signing and OAuth token encryption secret. Required in production; changing it signs every user out and invalidates stored Google tokens. |
| `CONTACT_FORM_RECIPIENT` | Address that receives `POST /contact/send-message` messages. Unset, messages go to the maintainer's address. |
| `CONTACT_FORM_SENDER` | `From` header for contact-form email, e.g. `Me <noreply@example.com>`. |
| `DATABASE_URL` | Postgres connection string for the auth tables. Unset, it connects to the maintainer's Supabase pooler with `SUPABASE_DB_PASSWORD`. |
| `ELEVENLABS_API_KEY` | Speech-to-text, text-to-speech and voice list. |
| `EMAIL_SERVICE_URL` | Base URL of an email-service instance, for contact forms and `/api/messaging` email. |
| `GOOGLE_AUTH_PROVIDER_CLIENT_ID`, `GOOGLE_AUTH_PROVIDER_CLIENT_SECRET` | Google sign-in and Google Tasks access. |
| `LLM_SERVICE_URL` | Base URL of an llm-service instance. |
| `RECAPTCHA_V3_SECRET_KEY` | Verifies the contact form's reCAPTCHA token. |
| `SHARED_APP_TOKEN` | API key sent to email-service, llm-service and bucket-service. |
| `SUPABASE_DB_PASSWORD` | Supabase database password, used only when `DATABASE_URL` is unset. |
| `STORAGE_SERVICE_URL` | Base URL of a bucket-service instance. |
| `SUPABASE_SECRET_KEY`, `SUPABASE_URL` | Supabase project for public event calendars. `SUPABASE_URL` defaults to the maintainer's project. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | SMS through `/api/messaging`. |
| `VB_EXPRESS_API_KEY` | Seeds an API key with every service permission, so `/api/*` is usable before any user signs in. |

## Route Dependencies

| Routes | Needs |
| --- | --- |
| `/api/auth/*`, `/api/admin/api-keys` | Postgres; Google sign-in needs OAuth. |
| `/api/storage` | bucket-service |
| `/api/calendar`, `/api/chat`, `/api/llm`, `/api/price-tracker`, `/api/recipe`, `/api/tasks/parse-image`, `/api/where-is` | llm-service |
| `/api/messaging`, `POST /contact/send-message` | email-service, Twilio, reCAPTCHA (contact form only) |
| `/api/public/event-calendars` | Supabase |
| `/api/speech-to-text`, `/api/text-to-speech`, `/api/voice-list` | ElevenLabs |
| `/api/tasks` | Google OAuth with the Tasks scope |

The full contract is served at `/docs`.

## Auth Database

Better Auth's `user`, `session`, `account`, `verification` and `apikey` tables live in the `vb_express_auth` schema, which every pooled connection sets as its `search_path`. Google access and refresh tokens in `account` are encrypted with `BETTER_AUTH_SECRET`; API keys are stored hashed. The app does not create them at boot: apply `supabase/migrations/*.sql` first (the repo's `scripts/migrate.ts` does this on deploy and `nx serve`). A Better Auth or `@better-auth/api-key` upgrade that adds columns needs a new migration; generate its SQL with Better Auth's `getMigrations(...).compileMigrations()` against a database already at the current schema.

## Supabase Table

`GET /api/public/event-calendars` reads `event_calendars` with columns `id`, `name`, `google_calendar_id`, `is_public` and `created_at`, and returns only rows where `is_public` is true.

## Nuances

- CORS and better-auth's trusted origins are a fixed list in `src/main.ts` and `src/auth.ts`, so browser clients on other origins are blocked. Server-to-server calls are unaffected.
- The `VB_EXPRESS_API_KEY` seed key is owned by a hardcoded account email in `src/libs/api-key-seed.ts`; the account is created if missing.
