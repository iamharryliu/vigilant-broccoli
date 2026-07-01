# Google Tasks

## Overview

- Standalone task list component in `vb-manager-next` for quick task management
- Direct Google Tasks API integration with Google OAuth session
- Supports sorting, filtering, and voice-based task creation

## Features

### Task Creation

- Single or multiple tasks via `*item1 > item2 > item3` delimiter syntax
- Voice input with AI transcription ([VoiceListGenerator](#voice-list-generator))
- Tasks created in reverse order to maintain list display order

### Task Management

- Mark complete/incomplete
- Delete tasks
- Drag-drop reordering with `@dnd-kit`
- Real-time sync with Google Tasks API

### Sorting Modes

- **Default** — maintains Google Tasks list order
- **Eisenhower Matrix** — groups by priority quadrant (Q1-Q4)
- **Commit Type** — extracts and groups by commit type prefix (e.g., `feat:`, `fix:`, `docs:`)

### Voice List Generator

- Records audio and sends to `/api/speech-to-text` for transcription
- Transcription forwarded to `/api/voice-list` for AI-powered list parsing
- Uses OpenAI GPT-4O-mini with structured output validation (zod schema)
- Returns array of parsed task items for bulk creation

## API Endpoints

- `GET /api/tasks` — fetch task lists and items
- `POST /api/tasks` — create task
- `PATCH /api/tasks/{id}` — update task (complete, title, notes)
- `DELETE /api/tasks/{id}` — delete task
- `POST /api/tasks/move` — reorder task within list
- `POST /api/speech-to-text` — transcribe audio to text
- `POST /api/voice-list` — generate task list from transcript

## Commit Type Detection

- Regex pattern: `^([\w&]+)[(:]/i`
- Extracts alphanumeric types (e.g., `feat`, `fix`, `elva11`)
- Strips Eisenhower quadrant prefix before parsing
