# Chat Room

One live room per environment on `socket-server-socketio`, open only to identities Cloudflare Access admits.

## Table of Contents

- [Request flow](#request-flow)
- [Environments](#environments)
- [Configuration](#configuration)
- [Nuances](#nuances)

## Request flow

| Step | Where | What happens |
| --- | --- | --- |
| 1. Edge | Cloudflare Access | Anonymous requests to `chat.harryliu.dev` / `staging-chat.harryliu.dev` get a 302 to the Access login; admitted requests carry a signed `Cf-Access-Jwt-Assertion` header. |
| 2. Proxy | `src/proxy.ts` | Every route except build assets and icons verifies the assertion against the team JWKS, issuer and the environment's application audience, and returns 403 otherwise. |
| 3. Page | `src/app/page.tsx` | Reads the verified `email` claim and shows it as the sender. |
| 4. Receive | Browser | `useChatRoom` from `react-lib-higher-level` subscribes to app `chat`, room `NEXT_PUBLIC_CHAT_ROOM` over an unauthenticated socket. |
| 5. Send | `POST /api/publish` | Re-verifies the assertion, rejects cross-site requests, takes the sender from the email claim (the body carries only `text`, at most 2000 characters) and publishes through the socket server's `POST /publish` with `SHARED_APP_TOKEN`. |

## Environments

| Environment | Vercel project | Host | Room |
| --- | --- | --- | --- |
| Local | — | `pnpm nx serve chat` | `local`, sender `local-dev` |
| Production | `production-chat` | `chat.harryliu.dev` | `production` |
| Staging | `staging-chat` | `staging-chat.harryliu.dev` | `staging` |

## Configuration

| Variable | Source |
| --- | --- |
| `CF_ACCESS_AUD` | Vault `CHAT_STAGING_CF_ACCESS_AUD` / `CHAT_PRODUCTION_CF_ACCESS_AUD`, written by `pnpm tf:post-apply` from the `chat_access_aud` Terraform output. |
| `CF_ACCESS_TEAM_DOMAIN` | Hardcoded in `deploy-vercel.ts`. |
| `CHAT_DEV_SENDER` | Set by the `serve` targets; honoured only when `NODE_ENV` is `development`. |
| `NEXT_PUBLIC_CHAT_ROOM` | The deploy environment, set by `deploy-vercel.ts`. |
| `NEXT_PUBLIC_SOCKET_SERVER_URL`, `SOCKET_SERVER_URL` | Hardcoded in `deploy-vercel.ts`; `serve` maps Vault's `SOCKET_SERVER_URL`. |
| `SHARED_APP_TOKEN` | Vault. |

## Nuances

- The `*.vercel.app` aliases skip Cloudflare, and the app opts out of Vercel Authentication, so the proxy's JWT check is the only gate there. Keep the matcher covering every page and API route.
- Subscribing needs no token on the socket server: anyone who knows app `chat` and a room name can read messages, though only this app can publish. Do not send secrets.
- Messages are not stored; a reload starts with an empty list.
- The custom hosts are proxied, so Vercel renews its origin certificate over HTTP-01 through Cloudflare. A bypass Access application leaves `/.well-known/acme-challenge` and `/.well-known/vercel` open for that.
