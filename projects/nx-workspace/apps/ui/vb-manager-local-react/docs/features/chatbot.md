# Chatbot (Jarvis)

## Overview

- AI assistant dialog and full page (`/chatbot`)
- Streams responses via `llm-service`; default model `gpt-4o`
- Calendar and tasks actions require Google OAuth session

## Chat

- Streaming responses with typing indicator; stop mid-stream supported
- Conversation history compacted after 20 messages (oldest dropped)
- Model selector — auto-switches to vision model when images are attached
- Fullscreen toggle via button or `F` key; clear conversation via rotate icon

## Input

- Enter to send, Shift+Enter for newline
- Voice input — mic button; transcript streams into input field in real time
- Voice output — responses read aloud; stops on dialog close
- Image attach via button or drag-and-drop; multiple images supported

## Slash Commands

Type `/` to open command menu (arrow keys, Enter/Tab to select, Escape to dismiss).

- `/calendar` — parse text/images into a Google Calendar event draft
- `/tasks` — extract task list from text/images into a Google Tasks draft
- `/help` — list commands

## Calendar Integration

- Also triggered automatically when message contains intent keywords (`add to calendar`, `create event`, `schedule this`, etc.)
- LLM extracts event details via function calling; presents editable draft card before creating
- Multiple/recurring events produce multiple draft cards
- Correction flow — reply in chat to correct a draft ("make it every Tuesday–Thursday"); draft updates in place

## Google Tasks Integration

- LLM extracts task titles from text or images
- User picks an existing list or creates a new one before tasks are created

## Suggestions

- Callers pass a `suggestions` prop — shown as buttons on empty conversation
- Each fires a chat message or a custom `onClick` handler
