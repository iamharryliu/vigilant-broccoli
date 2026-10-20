# Office Presence Local Mock

Browser mock of the Office Presence Slack app, for trying the UI without Slack. The same session machinery backs the hosted demo.

## Table of Contents

- [Run](#run)
- [How it works](#how-it-works)
- [Behaviour](#behaviour)
- [Nuances](#nuances)

## Run

`nx serve:mock office-presence-service`, then open http://localhost:3100 (`MOCK_PORT` overrides the port). The `serve:mock` and `build-mock` targets live in the service's `project.json`; `mock.main.ts` is the entry.

## How it works

- `registerOfficePresenceHandlers` in `office-presence-app.ts` is shared by the Socket Mode app, the HTTP receiver and the mock, so the mock runs the real view builders and action handlers. Its `allowDemoRecipients` option is set only for mock clients; real Slack clients never address seeded `U_DEMO_` members.
- `mock/mock-slack.ts` stands in for Bolt's `App` and Slack's `WebClient`; it records `views.*`, `chat.*` and `conversations.open` calls instead of sending them. Like Slack, block actions carry the `view` they came from (top modal, else Home), which the office-days checkbox handler reads to know which dates it rendered. One instance holds one visitor's home view, modals, messages and group chats.
- `demo/demo-api.ts` (`createDemoApi`) owns a bounded, expiring map of those instances keyed by session id and exposes `state`, `action`, `submit`, `close-modal`, `preview-reminder` and `reset`. Presences, events and settings are not in the session: handlers write them to SQLite as usual.
- `mock/mock-server.ts` serves the page (`mock/mock-ui.ts`) and maps `/api/<operation>` onto `createDemoApi` with a single anonymous session. The hosted service maps `/demo/<operation>` onto the same function, with the browser's `X-Demo-Session`; the static React UI in `apps/ui/office-presence-ui` is a port of `mock-ui.ts` that talks to it.
- `demo/demo-seed.ts` seeds the five-member team from `consts/demo-users.const.ts` (ids prefixed `U_DEMO_`) for the current and coming week from a fixed weekly plan, relative to today in the reminder timezone. The mock client's `users.info` has no `tz`, so every mock user's "today" is that timezone too.

## Behaviour

- Pick a teammate under "Viewing as" to see their Home tab; changes show up for others when you switch.
- Lunch asks, reminder previews and ephemeral notices appear under Messages.
- Data resets on restart or with "Reset demo data" (which reseeds only seeded rows).

## Nuances

- `OFFICE_PRESENCE_DB=:memory:` must be set before the lib loads (`mock.env.ts`, imported first) because `db.utils.ts` opens its database at import time; `runOfficePresenceMock` throws otherwise, so the mock can never write `state.db`. The hosted service opens a file on the Fly volume instead.
- The renderer covers only the blocks and elements this app uses; add support in `mock-ui.ts` and in `office-presence-ui`'s `BlockView`/`ElementView` before using a new one.
- Seeded members render as plain-text names (`utils/mention.utils.ts`) in every mode, so a Home view never contains a `<@U_DEMO_*>` mention Slack cannot resolve.
