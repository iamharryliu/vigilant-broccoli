# Chatbot

Streaming chatbot UI and history shared by local-manager-next's `/chatbot` page and the `chat` app; each app supplies its own request, settings and extras.

## Exports

| Export | Purpose |
| --- | --- |
| `ChatbotMessage`, `ChatbotImage`, `SetChatbotMessages` | Base message types; apps extend `ChatbotMessage` (local-manager-next adds draft cards). |
| `ChatHistorySidebar` | Search, new chat, rename, pin, delete with confirmation. The `settings` prop fills its Chat settings view. |
| `ChatInputArea` | Textarea, image attach and send/stop. Slots: `aboveInput`, `leadingControls`, `footer`. |
| `ChatMarkdown` | GitHub-flavored Markdown with highlighted code blocks and a copy button. |
| `ChatMessagesArea` | Message list with copy, regenerate and edit-and-resend. `renderMessageExtras`, `hasActions` and `isEditable` let an app render cards and opt messages out. |
| `useChatHistory(storageKeys)` | Chats in local storage under the caller's keys, capped at 50 with pinned chats dropped last. |
| `useChatStream({ setMessages, request, onResponse, onReplyComplete, onInterrupt })` | Streams a plain-text response into the last message. Also returns `beginRun`, `sendRequest` and `endRun` for callers that prepare the request themselves. |
| `compactConversation`, `patchLastMessage`, `patchMessageAt`, `finalizeLastMessage`, `CHAT_ERROR_MESSAGE` | Message helpers and constants. |

## Nuances

- The server route stays in each app: the models, system prompt and knowledge base search differ, and the two routes still share a copy of the OpenAI stream wrapper.
- Styling is Tailwind; an app's `tailwind.config.js` must include `libs/@vigilant-broccoli/react-lib-higher-level/src/lib/chatbot` in `content`.
- Each app passes its own `storageKeys` so histories stay separate; local-manager-next keeps its original `vb-manager-chats` keys.
- `ChatPanel` is the chat room's component; the chatbot's panel is composed in each app from these parts.
