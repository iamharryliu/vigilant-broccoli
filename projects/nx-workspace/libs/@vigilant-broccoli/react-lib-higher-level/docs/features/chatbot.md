# Chatbot

Streaming chatbot UI and history shared by local-manager-next's `/chatbot` page and the `chat` app; each app supplies its own request, settings and extras.

## Exports

| Export | Purpose |
| --- | --- |
| `ChatbotMessage`, `ChatbotImage`, `SetChatbotMessages` | Base message types; apps extend `ChatbotMessage` (local-manager-next adds draft cards). |
| `ChatHistorySidebar` | Search, new chat, rename, pin, delete with confirmation. The `settings` prop fills its inline Chat settings view; `onOpenSettings` replaces that view so the app can render settings in the page (both apps do). |
| `ChatSettings`, `ChatSettingsPage` | Assistant (model, knowledge base) and Voice agent (speak replies, ElevenLabs free voice) sections; `ChatSettingsPage` is the in-page overlay that covers the chat panel without unmounting it. |
| `useChatSettings({ models, defaultModel, storageKeys })` | The settings state persisted in local storage under the app's own keys. |
| `useReplySpeech({ speakReplies, voiceId, speak, stop })` | `onReplyComplete` and `onInterrupt` for `useChatStream` that honour the mute and voice settings. |
| `ChatInputArea` | Textarea, image attach and send/stop. Slots: `aboveInput`, `leadingControls`, `footer`. The optional `speech` prop (`isRecording`, `isProcessing`, `error`, `onToggleRecording`, e.g. from react-lib's `useSpeechToText`) adds a microphone toggle, recording placeholders and the error line; omitted, the input is text-only. |
| `ChatMarkdown` | GitHub-flavored Markdown with highlighted code blocks and a copy button. |
| `ChatMessagesArea` | Message list with copy, regenerate and edit-and-resend. `renderMessageExtras`, `hasActions` and `isEditable` let an app render cards and opt messages out. |
| `useChatHistory(storageKeys)` | Chats in local storage under the caller's keys, capped at 50 with pinned chats dropped last. |
| `useChatStream({ setMessages, request, onResponse, onReplyComplete, onInterrupt })` | Streams a plain-text response into the last message. Also returns `beginRun`, `sendRequest` and `endRun` for callers that prepare the request themselves. |
| `compactConversation`, `patchLastMessage`, `patchMessageAt`, `finalizeLastMessage`, `CHAT_ERROR_MESSAGE` | Message helpers and constants. |

## Nuances

- Both apps speak each finished reply through `useReplySpeech`, passing react-lib's `useTextToSpeech` `speak` and `stop`. `runChat` keeps the `onReplyComplete` it started with, so the hook reads the mute and voice settings through refs.
- The server route stays in each app: the models, system prompt and knowledge base search differ, and the two routes still share a copy of the OpenAI stream wrapper.
- Styling is Tailwind; an app's `tailwind.config.js` must include `libs/@vigilant-broccoli/react-lib-higher-level/src/lib/chatbot` in `content`.
- Each app passes its own `storageKeys` so histories stay separate; local-manager-next keeps its original `vb-manager-chats` keys.
- `ChatPanel` is the chat room's component; the chatbot's panel is composed in each app from these parts.
