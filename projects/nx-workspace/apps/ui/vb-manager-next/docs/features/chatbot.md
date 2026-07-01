# Chatbot (Jarvis)

## Overview

- AI assistant built into the dashboard, named Jarvis
- Accessible as a floating dialog or full page (`/chatbot`)
- Streams responses from `llm-service` (vb-express) via `/api/chat`
- Requires Google OAuth session for calendar and tasks integrations

## Chat

- Streaming text responses with a typing indicator while waiting
- Conversation history sent with each message (compacted after 20 messages)
- Model selector — filtered to non-image-output models; switches to vision-capable models when images are attached
- Default model: `gpt-4o`
- Fullscreen toggle via button or press `F`
- Clear conversation via rotate icon
- Stop streaming mid-response

## Input

- Text textarea — Enter to send, Shift+Enter for newline
- **Voice input** — speech-to-text via microphone button; transcript populates the input field in real time
- **Voice output** — assistant responses are read aloud via text-to-speech; stops on dialog close
- **Image upload** — attach via button or drag-and-drop onto the message area; images sent alongside the message content
- Multiple images supported; each shows a preview with a remove button

## Slash Commands

Type `/` to open the command menu (arrow keys to navigate, Enter/Tab to select, Escape to dismiss).

- `/calendar` — parse input text and/or images into a Google Calendar event draft
- `/tasks` — extract a task list from input text and/or images into a Google Tasks draft
- `/help` — show all available commands

## Calendar Integration

- Triggered by `/calendar` slash command **or** automatically when chat message contains intent keywords (`add to calendar`, `create event`, `schedule this`, etc.)
- `/api/chat` calls OpenAI directly with a `create_calendar_event` tool definition; if the model invokes it, returns structured event JSON instead of streaming
- Presents an editable `EventDraftCard` (title, start, end, all-day toggle, location, description) before creating anything
- User confirms → `POST /api/calendar/events` → Google Calendar API
- **Multiple/recurring events** — LLM populates `additionalEvents`; each gets its own draft card
- **Correction flow** — draft messages store serialized event details as message content (prefixed `[Calendar event draft]`); follow-up corrections re-trigger intent detection and replace old draft cards

## Google Tasks Integration

- Triggered by `/tasks` slash command
- Sends text and/or images to `/api/tasks/parse-image` (llm-service); returns a list of task titles
- Presents a `TaskListDraftCard` for review; user picks an existing list or creates a new one
- Tasks created sequentially via `/api/tasks`

## Suggestions

- Callers can pass `suggestions` prop — shown as buttons on an empty conversation
- Each suggestion fires a chat message or runs a custom `onClick` handler

## Constraints

- Calendar and tasks creation require an authenticated Google session
- Image input restricts model selection to vision-capable models only
- Conversation compacted (oldest messages dropped) when history exceeds 20 messages
