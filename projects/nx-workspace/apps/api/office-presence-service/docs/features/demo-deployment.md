# Demo Deployment

How the single `demo` environment of Office Presence is deployed: one Fly service plus a Cloudflare Pages UI that calls it.

## Table of Contents

- [Architecture](#architecture)
- [Shared vs Per-Visitor State](#shared-vs-per-visitor-state)
- [Fake and Real Members](#fake-and-real-members)
- [Routes](#routes)
- [Seeding](#seeding)
- [Fly Service](#fly-service)
- [Suspend vs the 3-Second Ack](#suspend-vs-the-3-second-ack)
- [Manual Setup](#manual-setup)
- [Free Tier](#free-tier)

## Architecture

`SLACK_MODE=http` and `DEMO_MODE=true` on `demo-office-presence-service` make one process serve both audiences from the same SQLite file on the `office_presence_data` volume:

- the real Slack workspace through the Request URLs `/slack/events`, `/slack/interactivity` and `/slack/commands`;
- the browser UI (`apps/ui/office-presence-ui` on Pages) through `/demo/*`.

The Pages site never touches the database; it only calls the service over HTTPS. `registerOfficePresenceHandlers` is the one handler registration behind all of it, including the Socket Mode app and the local mock.

## Shared vs Per-Visitor State

| State | Where |
| --- | --- |
| Presences, events, user settings | SQLite, shared by Slack and every UI visitor |
| Home view, modal stack, message transcript, group chats | In memory per session (`createMockSlack`) |

The UI keeps a random session id in `localStorage` and sends it as `X-Demo-Session`. Sessions expire after 30 minutes idle and at most 200 live at once (least recently used goes first), so a restart or eviction only loses a visitor's open dialogs and messages, never domain rows.

## Fake and Real Members

- Seeded members use ids prefixed `U_DEMO_`; the prefix is the "seeded" flag, so the SQLite schema is unchanged and existing `state.db` files stay compatible.
- In Slack modes no API call targets a fake id: lunch asks drop them before `conversations.open`, and views render them as plain-text names instead of `<@id>`. Only the per-visitor mock client may address them.
- The seeder only deletes `U_DEMO_` presences, events they created, and their settings. `DEMO_REAL_USER_IDS` lets it also add presences for real members; it uses `INSERT OR IGNORE`, so a member's own entries are never overwritten and those added rows are never removed.
- Seeded members have no Slack timezone, so their "today" is `REMINDER_TIMEZONE`; real members use their own Slack `tz`.
- The workspace is private and test-only, so the UI lists every workspace member (via `users.list`, cached 5 minutes) and can act as any of them; actions then write that member's real rows.

## Routes

| Route | Mode and flag | Auth |
| --- | --- | --- |
| `GET /`, `GET /docs`, `GET /docs/json` | `http` | none |
| `POST /slack/events`, `/slack/interactivity`, `/slack/commands` | `http` | Slack signing secret |
| `POST /demo/{state,action,submit,close-modal,preview-reminder,reset}` | `http` + `DEMO_MODE` | CORS to `DEMO_UI_ORIGIN` |
| `POST /internal/seed` | `http` + `DEMO_MODE` | bearer token |
| `POST /internal/reminders` | `http`, token configured | bearer token |

Socket Mode exposes no HTTP surface. Demo routes are limited to 120 requests/minute per client (`reset`: 5/minute) with a 32 KB body limit; the swagger spec in `src/libs/swagger.ts` documents every route.

## Seeding

- `POST /internal/seed` replaces seeded rows for the coming week (Monday to Friday, or to Sunday with `INCLUDE_WEEKENDS`, in `REMINDER_TIMEZONE`, `America/Toronto` on the demo) and deletes seeded rows older than the current week, plus any rows of seeded ids no longer in the roster. `{"includeCurrentWeek": true}` also reseeds this week. Repeat calls give the same data.
- The seeded team is deliberately quiet: five members, one to three in the office per day from a fixed weekly plan, two notes, one dog, and two events placed by weekday ("Team lunch" on Wednesday, "Demo Friday" on Friday; at most one event per day) on the first such day not already past.
- `cron-seed-office-presence-demo` calls it weekly (Sunday evening UTC) with `OFFICE_PRESENCE_INTERNAL_TOKEN` read from Vault by the vault-secrets action — no repo secret.
- The UI's "Reset demo data" calls `POST /demo/reset`, which reseeds the current and coming week and clears the visitor's session. Because every visitor shares the rows, it is rate limited.
- On boot, an empty volume is seeded once so a first deploy is not blank.
- Reminders in HTTP mode are `POST /internal/reminders` for an external scheduler; the demo does not schedule it. `/preview-reminder` works in both modes.

## Fly Service

`deployment-configs/fly-configs/demo-office-presence-service.toml`: one machine (256 MB), `[mounts]` volume `office_presence_data` at `/data`, `OFFICE_PRESENCE_DB=/data/state.db`, `auto_stop_machines = 'suspend'`, health check `GET /`. The image is the self-hosters' image (`iamharryliu/office-presence-service`); `deploy:demo` pushes it, sets secrets from Vault (`.env.example`) and runs `flyctl deploy --image`. Keep the count at one machine: SQLite on a volume cannot be shared across machines.

## Suspend vs the 3-Second Ack

Slack gives an endpoint 3 seconds. With `suspend` the machine resumes from a memory snapshot, usually well under a second, so the first request after idle normally still acks in time; Fly's proxy holds the request while it resumes. A cold `stop` boot (Node plus SQLite) can exceed 3 seconds, which is why the config uses `suspend`. If Slack shows errors for the first interaction after idle:

- set `min_machines_running = 1` in the Fly config to keep the machine warm (about $2/month for 256 MB, see [Free Tier](#free-tier));
- or accept it: the receiver ignores Slack's retry (`X-Slack-Retry-Num`), so a slow resume can never run a handler twice, and the user's next click works.

The ack is sent as soon as a handler calls `ack()`, and the handler continues afterwards; a machine that suspends mid-handler resumes it with the next request.

## Manual Setup

- Stop any Socket Mode instance of the demo app and switch the Slack app to HTTP ([slack-app-setup.md](./slack-app-setup.md)).
- Vault `kv/data/secrets`: `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `OFFICE_PRESENCE_INTERNAL_TOKEN` (generate a random string).
- Create the Fly volume before the first deploy if the automatic mount creation is not wanted: `flyctl volumes create office_presence_data -a demo-office-presence-service -r yyz -n 1 --size 1`.
- The first `deploy:demo` creates the `demo-office-presence-ui` Pages project.
- Dispatch `cron-seed-office-presence-demo` once to confirm the token works.
- Optional: `DEMO_REAL_USER_IDS` (comma-separated Slack member ids) in the Fly `[env]` block.

## Free Tier

- Fly.io has no free allowance for newer orgs: a 256 MB machine that suspends when idle costs about $0, the 1 GB `office_presence_data` volume about $0.15/month, and an always-on machine (`min_machines_running = 1`) about $2/month. Rates: [flyio.md](../../../../../../../notes/tech/software/web-dev/devops/flyio.md#free-tier).
- Cloudflare Pages static hosting for `demo-office-presence-ui`; one more project of 100 per account.
- Slack: the app runs in the existing private workspace; HTTP mode adds no Slack cost.
- Docker Hub: the same public image as before.
