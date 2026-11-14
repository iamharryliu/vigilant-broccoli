# Self-Hosting

Run Tasks from the `iamharryliu/tasks-next` image against your own Supabase project and Google OAuth client.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Nuances](#nuances)

## Prerequisites

1. A Google Cloud OAuth client (web application) with the Google Tasks API enabled.
2. A Supabase project with the Google provider enabled, using that client's ID and secret.
3. In Supabase's URL configuration, the exact `https://<your host>/auth/callback` on the redirect allow-list. A `/*` entry does not match it ([Embed](./embed.md#sign-in)).
4. The `google_oauth_tokens` table: run [`supabase/migrations/20261114000000_ensure_google_oauth_tokens.sql`](../../supabase/migrations/20261114000000_ensure_google_oauth_tokens.sql) in the project's SQL editor.

## Run from Registry

The `deploy-container` target in `project.json` builds and pushes the image for `linux/amd64` (Apple Silicon runs it under emulation).

```
docker run -d --name tasks --restart unless-stopped \
  --platform linux/amd64 \
  -p 3000:3000 \
  -e SUPABASE_URL=https://<project>.supabase.co \
  -e SUPABASE_PUBLISHABLE_KEY=<publishable key> \
  -e SUPABASE_SECRET_KEY=<secret key> \
  -e GOOGLE_AUTH_PROVIDER_CLIENT_ID=<client id> \
  -e GOOGLE_AUTH_PROVIDER_CLIENT_SECRET=<client secret> \
  -e TASKS_FRAME_ANCESTORS="https://<embedding site>" \
  iamharryliu/tasks-next:latest
```

Serve it over HTTPS at the host on the redirect allow-list. The container is stateless, listens on 3000 and runs as a non-root user.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `GOOGLE_AUTH_PROVIDER_CLIENT_ID`, `GOOGLE_AUTH_PROVIDER_CLIENT_SECRET` | The OAuth client configured in Supabase's Google provider; the server uses it to refresh the stored Google refresh tokens. Required. |
| `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL` | Supabase project for Google sign-in. The browser reads them from `/runtime-config.js` at load, so one image works with any project. Unset, they fall back to this repo's project, so always set both. |
| `SUPABASE_SECRET_KEY` | Server-side key that reads and writes `google_oauth_tokens`. Required. |
| `TASKS_FRAME_ANCESTORS` | Space- or comma-separated origins allowed to frame `/embed`, added to `'self'` in the `frame-ancestors` CSP. Unset, only the app itself may frame it. |

## Nuances

- Nothing deployment-specific is fixed at build time: the Supabase settings and the Content-Security-Policy (built per request in `src/proxy.ts`) come from the environment, so the published image needs no rebuild per deployment.
- Tasks is a sensitive Google scope. Until the OAuth app passes Google verification, sign-in shows an unverified-app warning, and while its publishing status is Testing, Google expires refresh tokens after 7 days, which surfaces as Reconnect Google.
