# Chat Room

One live room per environment on `socket-server-socketio`, open only to the Vercel team owner through Vercel Authentication.

## Table of Contents

- [Request flow](#request-flow)
- [Environments](#environments)
- [Configuration](#configuration)
- [Nuances](#nuances)

## Request flow

| Step | Where | What happens |
| --- | --- | --- |
| 1. Edge | Vercel Authentication | Anonymous requests to any path, including `/api/publish`, get a 302 to `vercel.com/sso-api`; `deploy-vercel.ts` enables it on every environment (`privateApp`). |
| 2. Page | `src/app/page.tsx` | Renders `ChatRoom`; `ChatPanel` picks a random sender name unless the visitor changes it. |
| 3. Receive | Browser | `useChatRoom` from `react-lib-higher-level` subscribes to app `chat`, room `NEXT_PUBLIC_CHAT_ROOM` over an unauthenticated socket. |
| 4. Send | `POST /api/publish` | Rejects cross-site requests, validates `text` (at most 2000 characters) and `sender` (at most 64), and publishes through the socket server's `POST /publish` with `SHARED_APP_TOKEN`. |

## Environments

| Environment | Vercel project | Host | Room |
| --- | --- | --- | --- |
| Local | — | `pnpm nx serve chat` | `local` |
| Production | `production-chat` | `chat.harryliu.dev` | `production` |
| Staging | `staging-chat` | `staging-chat.harryliu.dev` | `staging` |

## Configuration

| Variable | Source |
| --- | --- |
| `NEXT_PUBLIC_CHAT_ROOM` | The deploy environment, set by `deploy-vercel.ts`. |
| `NEXT_PUBLIC_SOCKET_SERVER_URL`, `SOCKET_SERVER_URL` | Hardcoded in `deploy-vercel.ts`; `serve` maps Vault's `SOCKET_SERVER_URL`. |
| `SHARED_APP_TOKEN` | Vault. |

## Nuances

- The sender is a client-supplied display name, not an identity: Vercel Authentication does not pass the signed-in user to the app.
- Subscribing needs no token on the socket server: anyone who knows app `chat` and a room name can read messages, though only this app can publish. Do not send secrets.
- Messages are not stored; a reload starts with an empty list.
