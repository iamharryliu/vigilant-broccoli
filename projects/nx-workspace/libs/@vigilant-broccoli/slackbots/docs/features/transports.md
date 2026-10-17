# Socket and HTTP Transports

How the Office Presence app receives Slack traffic in Socket Mode and in HTTP (Events API) mode.

## Table of Contents

- [Selecting a mode](#selecting-a-mode)
- [HTTP receiver](#http-receiver)
- [Reminders](#reminders)
- [Nuances](#nuances)

## Selecting a mode

`resolveSlackMode` reads `SLACK_MODE` (`socket` by default, `http`) and `validateSlackEnv` fails fast with the missing variable names: socket needs `SLACK_BOT_TOKEN` and `SLACK_APP_TOKEN`, http needs `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET`.

- **socket** — `runOfficePresenceApp` builds the Bolt app with `SlackUtils.getSocketApp()`; Bolt opens no inbound HTTP server without OAuth options.
- **http** — `createOfficePresenceHttpRuntime` builds the Bolt app on a custom receiver and returns `handleSlackRequest`; the host server (`apps/api/office-presence-service`, Fastify) owns the port, `/docs`, the demo routes and the internal routes.

Both register the same handlers through `registerOfficePresenceHandlers`.

## HTTP receiver

`http/slack-http-receiver.ts` implements Bolt's `Receiver` interface without a port:

1. Requires the raw body string (the Fastify Slack scope keeps JSON and form bodies unparsed) and verifies `X-Slack-Signature` with Bolt's `verifySlackRequest` — HMAC over `v0:timestamp:body`, five-minute freshness. Failures return 401.
2. Parses JSON events, form-encoded slash commands and `payload=` interactivity bodies; answers `url_verification` and `ssl_check`.
3. Acknowledges any request carrying `X-Slack-Retry-Num` with 200 without processing it, and drops a repeated `event_id` seen in the last 1000 events.
4. Passes everything else to `app.processEvent` and responds when a handler calls `ack()` (Bolt acks Events API events itself), or with an empty 200 after 2.5 seconds so Slack's 3-second limit is never hit. The handler keeps running after the response.

## Reminders

`node-cron` stays in socket mode only (`ENABLE_REMINDERS`). In HTTP mode, `POST /internal/reminders` on the service calls the same `createReminderSender` for an external scheduler. `/preview-reminder` works in both.

## Nuances

- `db.utils.ts` is synchronous `better-sqlite3`, opened at import time from `OFFICE_PRESENCE_DB` (default `state.db`); both modes use it unchanged.
- Responding at the ack and finishing later means a handler can still be running when a Fly machine suspends; see the trade-off in the service's `demo-deployment.md`.
