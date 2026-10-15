# Office Presence Local Mock

Browser mock of the Office Presence Slack app, for trying the UI without Slack.

## Run

`nx serve:mock office-presence-socket-server-demo`, then open http://localhost:3100 (`MOCK_PORT` overrides the port). The `serve:mock` and `build-mock` targets live in the demo app's `project.json`; `mock.main.ts` is the entry.

## How it works

- `registerOfficePresenceHandlers` in `office-presence-app.ts` is shared by the real Socket Mode app and the mock, so the mock runs the real view builders and action handlers.
- `mock/mock-slack.ts` stands in for Bolt's `App` and Slack's `WebClient`; it records `views.*`, `chat.*` and `conversations.open` calls instead of sending them.
- `mock/mock-server.ts` serves the page (`mock/mock-ui.ts`) and a small JSON API. The page renders Block Kit and posts clicks and modal submits back.
- `mock/mock-seed.ts` fills an in-memory database with the team from `mock/mock-users.const.ts`; dates are relative to today.

## Behaviour

- Pick a teammate under "Viewing as" to see their Home tab; changes show up for others when you switch.
- Lunch asks, reminder previews and ephemeral notices appear under Messages.
- Data resets on restart or with "Reset demo data".

## Nuances

- `OFFICE_PRESENCE_DB=:memory:` must be set before the lib loads (`mock.env.ts`, imported first) because `db.utils.ts` opens its database at import time; `runOfficePresenceMock` throws otherwise, so the mock can never write `state.db`.
- The renderer covers only the blocks and elements this app uses; add support in `mock-ui.ts` before using a new one.
