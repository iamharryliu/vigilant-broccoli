# Chat Demo

Feature Sandbox demos of three ways to authorize chat publishing against `socket-server-socketio`.

## Implementations

| Demo | Component | Sends through | Signed-out send |
| --- | --- | --- | --- |
| Backend relay | `BackendRelayChatDemo` | `/api/chat/publish`, which holds `SHARED_APP_TOKEN` and calls `POST /publish` | No, the auth proxy returns 401 |
| Identity provider JWT | `IdentityProviderChatDemo` | Socket, after the server verifies the Supabase JWT in the handshake | No, the server returns `forbidden` |
| Room tokens | `RoomTokenChatDemo` | Socket, after `/api/chat/token` issues a 15-minute token for `chat-demo` | Yes |

## Nuances

- The panel, `useChatRoom` and the constants come from `react-lib-higher-level` ([chat room](../../../../../libs/@vigilant-broccoli/react-lib-higher-level/docs/features/chat-room.md)); `useDemoChatRoom` wires it to `useSocketWithCertTrustPrompt`. The standalone `chat` app uses its own `chat` app id, so demo messages never reach it.
- All three share the `chat-demo` app and `lobby` room, so each demo receives messages from the others, and every demo receives over an unauthenticated subscription.
- `/api/chat/token` needs no bearer token so guests can use it, and allows 10 requests per minute per `x-forwarded-for` value in process memory. That header is client-supplied unless a trusted proxy sets it, so add a stronger limit before exposing the route publicly.
- A socket retry after an expired token must wait for `connect`: Socket.IO flushes buffered emits before firing it, so a buffered publish beats the resubscribe and the sender misses its own message. `chat-socket-publish.ts` handles this.
