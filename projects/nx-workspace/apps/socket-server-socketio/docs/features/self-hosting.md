# Self-Hosting

Run the Socket.IO and Server-Sent Events publish/subscribe server from the `iamharryliu/socket-server-socketio` image.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Protocol](#protocol)
- [Nuances](#nuances)

## Run from Registry

The image is multi-arch (`linux/amd64` and `linux/arm64`), listens on port 3000 and runs as a non-root user. It is stateless. Only user publishing depends on another service, Supabase Auth.

```
docker run -p 3000:3000 \
  -e SENDER_TOKEN=<token> \
  iamharryliu/socket-server-socketio:latest
```

`GET /health` returns `{"status":"ok"}`.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `HOST`, `PORT` | No | Listen address; the image sets `0.0.0.0` and `3000`. |
| `SENDER_TOKEN` | No | Token a client sends as `auth.token` in the Socket.IO handshake, or as `Authorization: Bearer <token>` on `POST /publish`, to publish. Unset, only verified users can publish, and only to `USER_PUBLISH_APPS`. |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | No | Supabase project that verifies user tokens from the Socket.IO handshake. Defaults to this repository's public project values, so set both when self-hosting. |
| `TLS_CERT_PATH`, `TLS_KEY_PATH` | No | PEM certificate and key paths, readable by the container's user. The server speaks HTTPS only when both are set. |
| `USER_PUBLISH_APPS` | No | Comma-separated `app` values that verified users can publish to. Defaults to `chat-demo`. |

## Protocol

| Event | Direction | Payload |
| --- | --- | --- |
| `message` | Server to subscribers | `{ app, receiverId, payload }` |
| `publish` | Sender or verified user to server | `{ app, receiverId, payload }`; an acknowledgement returns `{ ok: true }`, or `{ ok: false, code }` with `invalid` for a bad shape or `forbidden` for a client without publish rights, an app outside `USER_PUBLISH_APPS` or an expired user token. Reconnect with a fresh token after an expiry. |
| `subscribe` | Client to server | `{ app, receiverId }` joins the room `app:receiverId`. |
| `unsubscribe` | Client to server | `{ app, receiverId }` leaves the room. |

The same rooms are also reachable over HTTP; see [SSE transport](./sse-transport.md).

| Endpoint | Description |
| --- | --- |
| `GET /events?app=<app>&receiverId=<id>` | Server-Sent Events stream of the room's `message` events. |
| `POST /publish` | Bearer-authenticated JSON `{ app, receiverId, payload }`, delivered to Socket.IO and SSE subscribers. |

## Nuances

- Subscribing needs no token: anyone who can reach the server and knows an `app` and `receiverId` can receive its messages. Keep `payload` free of secrets or restrict network access.
- CORS allows every origin.
- Verified users are any account the Supabase project accepts, and publishing has no rate limit, so keep `USER_PUBLISH_APPS` to rooms where that is acceptable.
- Socket.IO messages are limited to 64kb, like `POST /publish`; a larger one disconnects the client.
- Rooms and subscriptions live in memory, so a restart drops them and clients must resubscribe. Run a single replica; there is no adapter to share rooms between instances.
