# Whiteboard

Shared real-time notes per home and board, with an AI document editing assistant.

## Table of Contents

- [Boards](#boards)
- [Sync Safety](#sync-safety)
- [Version History](#version-history)
- [Markdown Preview](#markdown-preview)
- [AI Edit](#ai-edit)
- [Routes](#routes)

## Boards

- `WhiteboardEditor` is shared by the home page (`family`), food planner `KitchenNotes` (`kitchen`), activity planner `ActivityNotes` (`activity`) and the standalone whiteboard page
- Each `homeId` + `boardKey` pair is a separate document, synced through `useWhiteboard` (Supabase broadcast room, debounced autosave, undo/redo)
- `WhiteboardEditor` flex-fills its flex-column parent. Hosts size it with `FULL_HEIGHT_PAGE_CLASS` or `PAGE_BODY_HEIGHT_CLASS` (`src/lib/page-layout.ts`), which are based on `--page-h`: the visible viewport minus the topbar and the bottom safe area. `AppLayout`'s `useVisualViewportHeight` sets that viewport height from `window.visualViewport`, so the inline editor and preview shrink above the on-screen keyboard (falling back to `100dvh`). While the keyboard is open and the page fits the visible height, it also resets the scroll iOS applies to reveal the caret, which would otherwise leave the shrunk board above the visible area, and centers the focused textarea's caret line (`src/lib/center-textarea-caret.ts`) so a tapped spot stays visible as the board shrinks. Below `lg`, the activity planner's stacked notes take one page-body height

## Sync Safety

- Undo/redo only covers this client's own typing and applied AI edits. The loaded snapshot and 409 conflict snapshots are applied with `replaceContent` (a non-tracked Yjs origin), so undo in a fresh tab cannot delete the seeded document
- `isLoading` stays true until `GET /api/whiteboard` succeeds; a failed load sets `loadError`, keeps the editor disabled (showing this browser's cached copy, if any) and shows a Retry button that calls `retryLoad`. Nothing is saved before a successful load
- Autosave only runs when the text differs from the last saved or loaded snapshot, so re-renders and token refreshes never re-save. An empty board is saved only when this client's own edit or undo/redo emptied it, sent with `allowEmpty: true`; otherwise the client skips the save
- `SyncedTextEditor` keeps the focused textarea's selection and scroll position when the text changes from elsewhere (a peer, conflict merge, undo or AI edit), shifting the caret by the length of an edit made before it

## Version History

- `whiteboard_history` (`home_id`, `board_key`, `content`, `created_at`) receives the previous non-empty `content` from an `AFTER UPDATE` trigger on `whiteboards` whenever the content changes, keeping the 50 newest rows per board. Home members can read it; clients cannot write it
- There is no UI. To recover a board, find the version in the Supabase SQL editor and copy it back; the restore itself is recorded as history:

```sql
select id, created_at, left(content, 80)
from whiteboard_history
where home_id = 2 and board_key = 'kitchen'
order by id desc;

update whiteboards
set content = (select content from whiteboard_history where id = <id>),
    updated_at = now()
where home_id = 2 and board_key = 'kitchen';
```

- Open tabs keep their live document, so reload them after a restore; otherwise their next save gets a 409 and they adopt the restored text

## Markdown Preview

- An eye icon button beside the chat icon toggles a read-only markdown rendering of the document using `MarkdownViewer` from `react-lib-higher-level` (the same renderer as docs-md: GFM via `marked`, sanitized with DOMPurify, Tailwind typography `prose` styling); the pencil icon returns to the editor. The AI edit dialog's document pane has the same toggle (without the chat button), with its own preview state. Content still syncs while previewing

## AI Edit

- The chat icon button (label "AI edit") in the top-right of the editor opens a large dialog: the editable document on the left, the chat on the right (stacked on small screens, full-screen on mobile)
- The dialog editor and the inline editor render the same synced `content`, so closing the dialog returns to the latest text
- The assistant receives the current document and the conversation; it replies conversationally and may propose a full updated document
- A proposal is shown as a line diff with Apply and Dismiss. Apply calls the same `setContent` as typing, so autosave, collaboration and undo/redo all work (undo reverts an applied edit)
- A proposal records the document it was based on; if the document changes while the request runs or the proposal is pending, Apply is replaced by "Regenerate with latest content"
- Chat state is in memory only and resets when the home or board changes; loading, error with Retry, and empty-document states are handled

## Routes

- `GET /api/whiteboard?homeId=&boardKey=` — returns `{ content, homeId, boardKey, updatedAt }` (`updatedAt` is `null` when the board has no row yet)
- `POST /api/whiteboard?homeId=&boardKey=` — body `{ content, baseUpdatedAt, allowEmpty }`; updates only when `baseUpdatedAt` matches the row, otherwise returns `409` with the current row. An empty `content` is refused with `409` when the row has text unless both `allowEmpty` and `baseUpdatedAt` are sent
- `POST /api/whiteboard/assistant` — body `{ homeId, boardKey, document, messages }`; requires a bearer token and an accepted membership of the home (`401`/`403` otherwise); returns `{ reply, updatedDocument }` where `updatedDocument` is `null` when no edit is proposed; `502` when the LLM gateway is unavailable. Uses the vb-express LLM gateway like `/api/food-planner/chat`, which is unchanged
