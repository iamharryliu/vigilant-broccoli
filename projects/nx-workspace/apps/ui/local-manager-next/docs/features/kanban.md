# Kanban Board

## Overview

- The Kanban page frames tasks-next's `/embed/board?session=parent` (`tasks-kanban-frame.component.tsx`), so the board UI, drag logic and Supabase row below live in tasks-next; the native `kanban.component.tsx` and `/api/kanban/boards` route are no longer rendered by the page. See [tasks-next Embed](../../../tasks-next/docs/features/embed.md)
- Google Tasks-backed swimlane board in `local-manager-next`
- Board setup synced per user via Supabase (cross-machine), shared with tasks-next's Google mode
- Requires Google OAuth session

## Data Model

- **Board** — named container with ordered lanes
- **Lane** — maps to a Google Tasks task list
- **Task** — individual Google Task item within a lane

## Features

### Boards

- Create, rename (double-click in sidebar or via ellipsis → Rename), delete boards
- Ellipsis menu on active board header: Rename, Delete (with confirmation)
- Drag to reorder boards in sidebar
- Sidebar collapsible; open/closed state persisted to `localStorage`

### Task Lists

- Manage Task Lists dialog (☰ button in sidebar header) for viewing all Google Task lists with each list's active (incomplete) task count, fetched when the dialog opens; Name/Count buttons sort the list, clicking the active one flips direction
- Rename lists (double-click or edit button) via Google Tasks API PATCH
- Delete lists with confirmation (permanently deletes from Google, removes associated lanes from all boards)
- Create new list from the Add Lane dialog (+ Create new list)

### Lanes

- Add lane by selecting a Google Tasks list (each list usable once per board)
- Creating a new list inline immediately adds it as a lane and closes the dialog
- Remove lane via ✕ button (confirmation dialog required)
- Drag handle in header to reorder; reorder is tracked in local state during drag and committed on drop
- Dragging lane resolves target by `taskListId` since `over` may be a task item droppable inside the lane, not the lane itself

### Tasks

- Drag tasks between lanes (creates in target first, then deletes from source)
- Drag to reorder within same lane (calls `/api/tasks/move` with previous task ID)
- Lane highlights on hover when dragging a task; non-target lanes show subtle drop zone hint
- Blue drop indicator bar shows between tasks during reorder
- Per-list sort mode (Default, Eisenhower, Commit Type, Date Created Newest/Oldest) synced with the board via Supabase

## State

- Board config (boards, lane order, active board, per-list sort modes): Supabase `app_kanban_boards`, keyed by user email and the `google` store
- Synced via `/api/kanban/boards` (GET / PUT), debounced on change
- Task data: fetched from Google Tasks API via `/api/tasks`, `/api/tasks/lists` (GET, POST, PATCH, DELETE)

## Supabase Sync

- Table `app_kanban_boards`, one row per `user_email` and `store`; this app always uses `store = 'google'`, the row tasks-next's Google mode reads, so both apps show the same boards (lane task list ids are the user's Google list ids)
- UI and drag logic: the shared `KanbanBoards` in `react-lib-tasks`; this app supplies its auth adapter, the board store (`createRemoteKanbanStore` over `/api/kanban/boards`) and the voice button
- Route: `src/app/api/kanban/boards/route.ts` via `createKanbanBoardsRouteHandlers` (secret key, scoped by email); schema in `supabase/migrations/20261125000200_ensure_app_kanban_boards.sql`
- User email resolved from the Supabase bearer token by `getUserEmail` (`libs/server-auth.ts`)
- Boards were copied once from the MongoDB `kanban_boards` collection (still in Mongo, unused)
- One-time migration: when the user's row is empty, existing `localStorage` boards + `google-tasks-sort-mode-*` keys upload, then `localStorage` keys cleared
- Standalone `GoogleTasksComponent` (outside the board) still uses `localStorage` for sort mode
- Last-write-wins: each change overwrites the whole user row (no merge / concurrency control), so two open tabs or apps overwrite each other's boards

## Drag Overlays

- Task: shows title, notes preview, due date, commit type badge, Eisenhower quadrant color
- Lane: header with skeleton task placeholders
- Board: compact sidebar-style chip with blue accent

## Constraints

- A task list can only appear once per board
- Requires authenticated session to load task lists

## Reference

- [Google Tasks](./google-tasks.md) — standalone task list with sorting, voice input, and multi-task creation
