# Self-Hosting

Run the Socket.IO publish/subscribe server from the `iamharryliu/socket-server-socketio` image.

## Table of Contents

- [Run from Registry](#run-from-registry)
- [Environment Variables](#environment-variables)
- [Protocol](#protocol)
- [Nuances](#nuances)

## Run from Registry

The image is multi-arch (`linux/amd64` and `linux/arm64`), listens on port 3000 and runs as a non-root user. It is stateless and needs no other service.

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
| `SENDER_TOKEN` | No | Token a client sends as `auth.token` in the Socket.IO handshake to become a sender. Unset, nobody can publish. |
| `TLS_CERT_PATH`, `TLS_KEY_PATH` | No | PEM certificate and key paths, readable by the container's user. The server speaks HTTPS only when both are set. |

## Protocol

| Event | Direction | Payload |
| --- | --- | --- |
| `message` | Server to subscribers | `{ app, receiverId, payload }` |
| `publish` | Sender to server | `{ app, receiverId, payload }`; an acknowledgement returns `{ ok: true }`, or `{ ok: false, code }` with `forbidden` for a non-sender or `invalid` for a bad shape. |
| `subscribe` | Client to server | `{ app, receiverId }` joins the room `app:receiverId`. |
| `unsubscribe` | Client to server | `{ app, receiverId }` leaves the room. |

## Nuances

- Subscribing needs no token: anyone who can reach the server and knows an `app` and `receiverId` can receive its messages. Keep `payload` free of secrets or restrict network access.
- CORS allows every origin.
- Rooms and subscriptions live in memory, so a restart drops them and clients must resubscribe. Run a single replica; there is no adapter to share rooms between instances.
