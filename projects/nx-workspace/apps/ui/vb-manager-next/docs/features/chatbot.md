# Chatbot

## Overview

- The assistant lives on the full chatbot page (`/chatbot`), opened through the Chatbot sidebar entry or `C` shortcut
- Streams responses directly from OpenAI through `/api/chat`; default model `gpt-4o-mini`
- Calendar and tasks actions require Google OAuth session

## Chat

- Streaming responses with typing indicator; stop mid-stream supported
- User messages render as bubbles; assistant responses render as plain text without a card container
- Conversation history compacted after 20 messages (oldest dropped)
- Model selector uses the 17 models listed in the account’s complimentary-token allowance; the chat API rejects other model IDs
- Automatically switches to an eligible vision model when images are attached; `o3-mini` is text-only
- Saved conversations in browser local storage, with new and select controls in the history sidebar; each chat's ellipsis menu offers rename, pin/unpin and delete
- Search box at the top of the history sidebar, above New chat, filters chats by title or message text (Escape clears it)
- Pinned chats list first and are the last to be dropped when the 50-chat cap is reached
- History sidebar toggles open and closed with a button at the top-left of the chat area; the choice persists in local storage

## Input

- Enter to send, Shift+Enter for newline
- Voice input — mic button; transcript streams into input field in real time
- Voice output — responses read aloud; playback and active chat streaming stop when leaving the page or switching conversations
- Image attach via button or drag-and-drop; multiple images supported

## Slash Commands

Type `/` to open command menu (arrow keys, Enter/Tab to select, Escape to dismiss).

- `/calendar` — parse text/images into a Google Calendar event draft; http(s) links in the text (up to 3) are fetched by vb-express and parsed too, using page JSON-LD, meta tags, embedded start/end fields and visible text; the pasted links are appended to each draft event's description
- `/tasks` — extract task list from text/images into a Google Tasks draft
- `/help` — list commands

## Calendar Integration

- A message that is only a link, or a link plus calendar words (`calendar`, `event`, `schedule`, `rsvp`, `add this`, `put this`), goes straight to the `/calendar` parser because the chat model cannot open links
- Also triggered automatically when message contains intent keywords (`add to calendar`, `create event`, `schedule this`, etc.)
- LLM extracts event details via function calling; presents editable draft card before creating
- Multiple/recurring events produce multiple draft cards
- Correction flow — reply in chat to correct a draft ("make it every Tuesday–Thursday"); draft updates in place

## Google Tasks Integration

- LLM extracts task titles from text or images
- User picks an existing list or creates a new one before tasks are created

## Suggestions

- Empty conversations offer Plan My Day when signed in
- Plan My Work Week appears Sunday through Wednesday
- Clicking either planning suggestion fetches current personal/work tasks, calendar events, and weather before building the prompt
- Only unfinished tasks are included; tasks without `Q1`–`Q4` title prefixes are kept in an `unclassified` group
- Stop cancels planning-data requests; failed refreshes show an error in chat rather than generating a plan with missing data
- Weather uses the existing endpoint’s cache (up to 10 minutes)
- Each fires a chat message or a custom `onClick` handler

## Free Tier

- 250,000 tokens/day shared across `gpt-5.4`, `gpt-5.2`, `gpt-5.1`, `gpt-5`, `gpt-4.1`, `gpt-4o`, `o1`, and `o3`
- 2,500,000 tokens/day shared across `gpt-5.4-mini`, `gpt-5.4-nano`, `gpt-5-mini`, `gpt-5-nano`, `gpt-4.1-mini`, `gpt-4.1-nano`, `gpt-4o-mini`, `o3-mini`, and `o4-mini`
- Eligibility and limits come from the account information supplied by the owner. OpenAI tracks usage; this app filters model selection but does not enforce the daily allowance or prevent charges after it is exhausted.
