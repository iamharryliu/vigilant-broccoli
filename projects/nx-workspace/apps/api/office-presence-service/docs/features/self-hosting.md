# Self-Hosting

Run the Office Presence Slack bot from the `iamharryliu/office-presence-service` image, in Socket Mode or over the HTTP Events API.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Modes](#modes)
- [Persisting State](#persisting-state)
- [Nuances](#nuances)

## Run from Registry

The image is `linux/amd64` only (the `better-sqlite3` native module is built for it), so pass `--platform linux/amd64` on ARM hosts. It runs as a non-root user and listens on port 3000 in HTTP mode.

Socket Mode, the default, needs no inbound traffic and no published port:

```
docker run --platform linux/amd64 \
  -e SLACK_BOT_TOKEN=xoxb-... \
  -e SLACK_APP_TOKEN=xapp-... \
  iamharryliu/office-presence-service:latest
```

HTTP mode serves the Slack Events API:

```
docker run --platform linux/amd64 -p 3000:3000 \
  -e SLACK_MODE=http \
  -e SLACK_BOT_TOKEN=xoxb-... \
  -e SLACK_SIGNING_SECRET=... \
  iamharryliu/office-presence-service:latest
```

Slack must reach the container over public HTTPS: put a reverse proxy or a tunnel in front of port 3000 and set the app's Request URLs to `https://<host>/slack/events`, `/slack/interactivity` and `/slack/commands`. The Slack app setup is in [slack-app-setup.md](./slack-app-setup.md).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DEMO_MODE` | No | `http` only; defaults to `false`. Enables `/demo/*` and `/internal/seed`. |
| `DEMO_REAL_USER_IDS` | No | Comma-separated real member ids the seeder also fills presences for. |
| `DEMO_UI_ORIGIN` | With `DEMO_MODE` | Comma-separated browser origins allowed to call `/demo/*`. |
| `ENABLE_REMINDERS` | No | `socket` only; defaults to `false`. Schedules the weekly reminder. |
| `INCLUDE_WEEKENDS` | No | Defaults to `false`. Includes weekends. |
| `OFFICE_PRESENCE_DB` | No | SQLite file path; defaults to `state.db` in the working directory. |
| `OFFICE_PRESENCE_INTERNAL_TOKEN` | `http` for `/internal/*` | Bearer token for `/internal/*`; without it `POST /internal/reminders` returns 401. |
| `OFFICES` | No | Comma-separated list of offices; defaults to Berlin, Stockholm, Paris and New York. |
| `PORT`, `HOST` | No | Listen address in `http` mode; the image sets `3000` and `0.0.0.0`. |
| `REMINDER_TIMEZONE` | No | Timezone of the reminder cron and of seeded weeks, and the fallback for "today" when a member's Slack timezone is unknown. |
| `SLACK_APP_TOKEN` | `socket` | Slack app-level token. |
| `SLACK_BOT_TOKEN` | Yes | Slack bot token. |
| `SLACK_MODE` | No | `socket` (default) or `http`. |
| `SLACK_SIGNING_SECRET` | `http` | Slack signing secret that verifies Events API requests. |

## Modes

| Mode | Needs | Public URL | Reminders |
| --- | --- | --- | --- |
| `http` | `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET` | HTTPS | `POST /internal/reminders` from your own scheduler |
| `socket` | `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN` | No | `node-cron` when `ENABLE_REMINDERS=true` |

The same handlers, views and SQLite schema run in both. The process exits at startup naming the missing variables when required env is absent, and rejects any other `SLACK_MODE` value. In `http` mode the container also serves `GET /` and `/docs`, and `POST /internal/reminders` takes `Authorization: Bearer <token>`.

## Persisting State

State lives in one SQLite file. Mount a volume and point `OFFICE_PRESENCE_DB` at it:

```
docker run ... -v office-presence-data:/data -e OFFICE_PRESENCE_DB=/data/state.db ...
```

The entrypoint chowns `/data` for the `node` user at boot, so a root-owned volume (Docker, Fly) works. Without the variable the file is `state.db` inside the container and is lost with it.

## Nuances

- A Slack app uses Socket Mode or Request URLs, never both, so the app configuration must match `SLACK_MODE`.
- Slack requires acknowledgement within 3 seconds; retries (`X-Slack-Retry-Num`) are acknowledged and ignored.
- The `/demo/*` routes and `/internal/seed` stay off unless `DEMO_MODE=true`, so a self-hoster never exposes a public mock API by accident.
- The server runs in UTC, so "today" (Home view dates, the past-date cutoff, check-out and modal date pickers) comes from each member's Slack `users.info` `tz`, cached for an hour. Seeded `U_DEMO_` members, the mock client and failed lookups fall back to `REMINDER_TIMEZONE`.
- The `Dockerfile` installs `better-sqlite3` and `node-cron` in the image because the esbuild bundle keeps both external.
- The demo deployment (Fly, Cloudflare Pages, seeding) is in [demo-deployment.md](./demo-deployment.md).
