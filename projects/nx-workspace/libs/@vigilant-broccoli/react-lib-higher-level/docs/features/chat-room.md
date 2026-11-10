# Chat Room

Socket.IO room subscription and message panel shared by the `chat` app and local-manager-next's Feature Sandbox chat demos.

## Exports

| Export | Entry point | Purpose |
| --- | --- | --- |
| `ChatPanel` | barrel | Message list, input and status. Shows `sender` when given, otherwise a random `user-xxxx` picked after mount. `listClassName` sizes the list (default `h-64`). Copy comes from its own `createI18n` dictionary (`en.json`). |
| `CHAT_DEMO_APP`, `CHAT_DEMO_ROOM`, `CHAT_PUBLISH_TIMEOUT_MS`, `CHAT_STATUS`, `ChatPayload`, `ChatRoomMessage`, `ChatStatus` | barrel and `@vigilant-broccoli/react-lib-higher-level/chat-room-consts` | Shared constants and types. |
| `useChatRoom({ socket, app, room, configured })` | barrel | Subscribes on every `connect` and collects messages for that app and room. Returns `{ status, messages }`. |

## Nuances

- The caller creates and owns the socket (URL, `auth`, reconnection, local-manager-next's certificate prompt). Pass `configured: false` when there is no socket server URL so the status reads closed instead of connecting forever.
- Server route handlers import constants through the `chat-room-consts` path alias, not the barrel, which also pulls in client components and browser-only libs.
- Cleanup removes only the hook's own listeners, so a caller's `connect`/`connect_error` handlers on the same socket stay attached.
