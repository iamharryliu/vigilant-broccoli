# Chatbot

Private OpenAI chatbot for the owner, a trimmed port of local-manager-next's [chatbot](../../../local-manager-next/docs/features/chatbot.md), gated by Vercel Authentication. The UI, history and streaming hooks come from the shared [chatbot](../../../../libs/@vigilant-broccoli/react-lib-higher-level/docs/features/chatbot.md) in `react-lib-higher-level`.

## Table of Contents

- [Request flow](#request-flow)
- [Environments](#environments)
- [Configuration](#configuration)
- [Nuances](#nuances)

## Request flow

| Step | Where | What happens |
| --- | --- | --- |
| 1. Edge | Vercel Authentication | Anonymous requests to any path, including `/api/chat`, get a 302 to `vercel.com/sso-api`; `deploy-vercel.ts` enables it on every environment (`privateApp`). |
| 2. Page | `src/app/page.tsx` | Renders `ChatPage`: history sidebar (search, rename, pin, delete) beside `ChatPanel`. |
| 3. Send | `POST /api/chat` | Streams `gpt-4o-mini` (or the model picked in Chat settings) as plain text; the route rejects models outside `CHAT_MODELS`. With the "Knowledge base" switch on (default, remembered in local storage), it first searches the [knowledge base](../../../local-manager-next/docs/features/knowledge-base.md) with the last 2 user messages and adds chunks with similarity of at least 0.3 (up to 5) to the system prompt; a failed search is skipped silently. |
| 4. Store | Browser local storage | Chats, current chat, sidebar state and model persist per browser. |

## Environments

| Environment | Vercel project | Host |
| --- | --- | --- |
| Local | — | `pnpm nx serve chat` |
| Production | `production-chat` | `chat.harryliu.dev` |
| Staging | `staging-chat` | `staging-chat.harryliu.dev` |

## Configuration

| Variable | Source |
| --- | --- |
| `OPENAI_API_KEY` | Vault. |
| `SUPABASE_SECRET_KEY` | Vault. |

## Nuances

- Not carried over from vb-manager: Google Calendar/Tasks slash commands, plan suggestions, voice input and output.
- The knowledge base is read-only here: upload and index files in vb-manager. `src/lib/knowledge-base.ts` duplicates only the search half of local-manager-next's `src/lib/knowledge-base.ts`; embedding model and dimensions must stay in sync with it and the `vector(512)` column.
- History is capped at 20 messages sent per request and 50 saved chats, as in vb-manager; it is never synced between browsers.
