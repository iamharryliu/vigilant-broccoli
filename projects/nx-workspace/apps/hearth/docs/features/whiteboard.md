# Whiteboard

Shared real-time notes per home and board, with an AI document editing assistant.

## Table of Contents

- [Boards](#boards)
- [Markdown Preview](#markdown-preview)
- [AI Edit](#ai-edit)
- [Routes](#routes)

## Boards

- `WhiteboardEditor` is shared by the home page (`family`), food planner `KitchenNotes` (`kitchen`), activity planner `ActivityNotes` (`activity`) and the standalone whiteboard page
- Each `homeId` + `boardKey` pair is a separate document, synced through `useWhiteboard` (Supabase broadcast room, debounced autosave, undo/redo)

## Markdown Preview

- An eye icon button beside the chat icon toggles a read-only markdown rendering of the document using `MarkdownViewer` from `react-utility` (the same renderer as docs-md: GFM via `marked`, sanitized with DOMPurify, Tailwind typography `prose` styling); the pencil icon returns to the editor. The AI edit dialog's document pane has the same toggle (without the chat button), with its own preview state. Content still syncs while previewing

## AI Edit

- The chat icon button (label "AI edit") in the top-right of the editor opens a large dialog: the editable document on the left, the chat on the right (stacked on small screens, full-screen on mobile)
- The dialog editor and the inline editor render the same synced `content`, so closing the dialog returns to the latest text
- The assistant receives the current document and the conversation; it replies conversationally and may propose a full updated document
- A proposal is shown as a line diff with Apply and Dismiss. Apply calls the same `setContent` as typing, so autosave, collaboration and undo/redo all work (undo reverts an applied edit)
- A proposal records the document it was based on; if the document changes while the request runs or the proposal is pending, Apply is replaced by "Regenerate with latest content"
- Chat state is in memory only and resets when the home or board changes; loading, error with Retry, and empty-document states are handled

## Routes

- `POST /api/whiteboard/assistant` — body `{ homeId, boardKey, document, messages }`; requires a bearer token and an accepted membership of the home (`401`/`403` otherwise); returns `{ reply, updatedDocument }` where `updatedDocument` is `null` when no edit is proposed; `502` when the LLM gateway is unavailable. Uses the vb-express LLM gateway like `/api/food-planner/chat`, which is unchanged
