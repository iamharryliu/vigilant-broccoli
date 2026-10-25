# Running the Server

Run the Slack bot from the published Docker image in Socket Mode or HTTP (Events API) mode, and the environment variables it reads.

## Table of Contents

- [Modes](#modes)
- [Build & Run](#build--run)
- [Run from Registry](#run-from-registry)
  - [Socket Mode](#socket-mode)
  - [HTTP Mode](#http-mode)
  - [With Optional Args](#with-optional-args)
- [Persisting State](#persisting-state)
- [Environment Variables](#environment-variables)
- [Nuances](#nuances)

## Modes

`SLACK_MODE` picks the transport at startup; the same handlers, views and SQLite schema run in both.

| Mode | Needs | Public URL | Reminders |
| --- | --- | --- | --- |
| `socket` | `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN` | No | `node-cron` when `ENABLE_REMINDERS=true` |
| `http` | `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET` | HTTPS | `POST /internal/reminders` from your own scheduler |

`socket` is the default, so existing deployments keep working. The process exits at startup with the missing variable names when required env is absent, and rejects any other `SLACK_MODE` value.

The Slack app has to match: a Slack app uses Socket Mode or Request URLs, never both. See [slack-app-setup.md](./slack-app-setup.md).

## Build & Run

The `build` and `deploy-container` targets in `project.json` bundle the app and build and push the Docker image. The image is `linux/amd64` only (the `better-sqlite3` native module is compiled for it), so run it with `--platform linux/amd64` on ARM hosts.

## Run from Registry

### Socket Mode

```
docker run --platform linux/amd64 \
  -e SLACK_BOT_TOKEN=xoxb-... \
  -e SLACK_APP_TOKEN=xapp-... \
  iamharryliu/office-presence-service:latest
```

Nothing listens for inbound traffic that matters, so no port needs publishing.

### HTTP Mode

```
docker run --platform linux/amd64 -p 3000:3000 \
  -e SLACK_MODE=http \
  -e SLACK_BOT_TOKEN=xoxb-... \
  -e SLACK_SIGNING_SECRET=... \
  iamharryliu/office-presence-service:latest
```

Slack must reach the container over **public HTTPS**: put a reverse proxy or a tunnel in front of port 3000 and set the app's Request URLs to `https://<host>/slack/events`, `/slack/interactivity` and `/slack/commands`. Requests are verified with the signing secret and must be acknowledged within 3 seconds; Slack retries (`X-Slack-Retry-Num`) are acknowledged and ignored.

In this mode the container serves `GET /` and `/docs`, the Slack routes, and `POST /internal/reminders`, which returns 401 until `OFFICE_PRESENCE_INTERNAL_TOKEN` is set (send it as `Authorization: Bearer <token>`). The `/demo/*` routes and `/internal/seed` stay off unless `DEMO_MODE=true`, so a self-hoster never exposes a public mock API by accident.

### With Optional Args

```
docker run --platform linux/amd64 \
  -e SLACK_BOT_TOKEN=xoxb-... \
  -e SLACK_APP_TOKEN=xapp-... \
  -e OFFICES=London,Stockholm,NYC \
  -e ENABLE_REMINDERS=true \
  -e INCLUDE_WEEKENDS=true \
  iamharryliu/office-presence-service:latest
```

## Persisting State

State lives in one SQLite file. Mount a volume and point `OFFICE_PRESENCE_DB` at it:

```
docker run ... -v office-presence-data:/data -e OFFICE_PRESENCE_DB=/data/state.db ...
```

The entrypoint chowns `/data` for the `node` user at boot, so a root-owned volume (Docker, Fly) works. Without the variable the file is `state.db` inside the container and is lost with it.

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `SLACK_MODE` | No | `socket` | `socket` or `http` |
| `SLACK_BOT_TOKEN` | Yes | - | Slack bot token |
| `SLACK_APP_TOKEN` | `socket` | - | Slack app-level token |
| `SLACK_SIGNING_SECRET` | `http` | - | Slack signing secret |
| `OFFICE_PRESENCE_DB` | No | `state.db` | SQLite file path |
| `OFFICES` | No | 4 sample cities | Comma-separated list of offices |
| `ENABLE_REMINDERS` | No | `false` | Schedule the weekly reminder (`socket` only) |
| `REMINDER_TIMEZONE` | No | `Europe/Stockholm` | Reminder cron, seeding weeks, and "today" when a member's Slack timezone is unknown |
| `INCLUDE_WEEKENDS` | No | `false` | Include weekends |
| `PORT` / `HOST` | No | `3000` / `0.0.0.0` in the image | Listen address (`http`) |
| `OFFICE_PRESENCE_INTERNAL_TOKEN` | `http` with `DEMO_MODE` | - | Bearer token for `/internal/*`; without it `/internal/reminders` returns 401 |
| `DEMO_MODE` | No | `false` | `http` only: enable `/demo/*` and `/internal/seed` |
| `DEMO_UI_ORIGIN` | `DEMO_MODE` | - | Comma-separated browser origins allowed to call `/demo/*` |
| `DEMO_REAL_USER_IDS` | No | - | Real member ids the seeder also fills presences for |

## Nuances

- `Dockerfile` pins `better-sqlite3` and `node-cron` and installs them in the image; the esbuild bundle keeps both external.
- The server runs in UTC, so "today" (Home view dates, the past-date cutoff, check-out and modal date pickers) comes from each member's Slack `users.info` `tz`, cached for an hour. Seeded `U_DEMO_` members, the mock client and failed lookups fall back to `REMINDER_TIMEZONE`.
- The demo deployment (Fly, Cloudflare Pages, seeding) is in [demo-deployment.md](./demo-deployment.md).
