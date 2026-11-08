# SSE Transport

One-way server-to-browser delivery over Server-Sent Events, with HTTP publishing, beside the Socket.IO transport kept for two-way needs.

## Table of Contents

- [Endpoints](#endpoints)
- [Consumers](#consumers)
- [Nuances](#nuances)

## Endpoints

| Endpoint | Request | Response |
| --- | --- | --- |
| `GET /events` | Query `app` and `receiverId` (the Socket.IO `subscriptionSchema`); no auth. | `text/event-stream`: a `:connected` comment, a `message` event per publish with data `{ app, receiverId, payload }`, and a `:keepalive` comment every 25s. 400 `{ code: "invalid", issues }` on a bad query. |
| `POST /publish` | `Authorization: Bearer <SENDER_TOKEN>`, JSON `{ app, receiverId, payload }` up to 64kb. | `PublishAck`: 200 `{ ok: true, receivers }`, 401 (no token) or 403 (wrong token) `{ ok: false, code: "forbidden" }`, 400 `{ ok: false, code: "invalid", issues }`. |

Both publish paths (`POST /publish` and the Socket.IO `publish` event) go through one fan-out, so either reaches Socket.IO room members and SSE subscribers of room `app:receiverId`; `receivers` counts both. Paths and query names are `SOCKET_SERVER_PATHS` and `SOCKET_SUBSCRIPTION_PARAMS` in `common-js`.

## Consumers

| Consumer | Transport |
| --- | --- |
| `.github/scripts/deploy-notify.mjs` (deploy-notify action) | `POST /publish` with Node's global `fetch` |
| `local-manager-next` `/api/notifications/test` | `POST /publish` with a 5s `AbortSignal.timeout` |
| `local-manager-next` deploy toasts | `useEventStream` (`EventSource`) |

## Nuances

- `EventSource.onerror` carries no detail, so `useEventStream` shows the self-signed-certificate trust toast after 3 consecutive errors without an `open`, and dismisses it on the next `open`.
- Server-side `fetch` rejects untrusted certificates exactly as `socket.io-client` did. `serve` maps the Vault `SOCKET_SERVER_URL` (publicly trusted) to both URLs; pointing `SOCKET_SERVER_URL` at a self-signed `https://localhost:3443` needs `NODE_EXTRA_CA_CERTS=<that cert>` for `/api/notifications/test`.
- Watchtower polls Docker Hub every 5 minutes, so a new image goes live after `deploy-fanout` fires. `test-e2e-socket-server-socketio` and `test-security-socket-server` wait for `POST /publish` to return 401 (`.github/scripts/wait-socket-server-publish.sh`) before their HTTP checks.
- Subscription is unauthenticated, as with Socket.IO (TODO `27b216`).
