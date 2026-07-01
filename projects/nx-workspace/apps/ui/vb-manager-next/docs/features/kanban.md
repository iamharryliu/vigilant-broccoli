# Kanban Board

## Overview

- Google Tasks-backed swimlane board in `vb-manager-next`
- Board setup synced per user via MongoDB (cross-machine)
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

- Manage Task Lists dialog (☰ button in sidebar header) for viewing all Google Task lists
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
- Per-list sort mode (Default, Eisenhower, Commit Type, Date Created Newest/Oldest) synced with the board via MongoDB

## State

- Board config (boards, lane order, active board, per-list sort modes): MongoDB, keyed by user email
- Synced via `/api/kanban/boards` (GET / PUT), debounced on change
- Task data: fetched from Google Tasks API via `/api/tasks`, `/api/tasks/lists` (GET, POST, PATCH, DELETE)

## MongoDB Sync

- Collection `kanban_boards`, one doc per `userEmail` (`MONGODB_URI`, `MONGODB_DB` default `vb-manager`)
- Client: `src/lib/mongo.ts`; data access: `src/app/api/kanban/db.ts`
- User email exposed on the NextAuth session (`src/lib/auth.ts`)
- One-time migration: when the user's Mongo doc is empty, existing `localStorage` boards + `google-tasks-sort-mode-*` keys upload, then `localStorage` keys cleared
- Standalone `GoogleTasksComponent` (outside the board) still uses `localStorage` for sort mode
- Last-write-wins: each change overwrites the whole user doc (no merge / concurrency control)

## Drag Overlays

- Task: shows title, notes preview, due date, commit type badge, Eisenhower quadrant color
- Lane: header with skeleton task placeholders
- Board: compact sidebar-style chip with blue accent

## Constraints

- A task list can only appear once per board
- Requires authenticated session to load task lists

## Reference

- [Google Tasks](./google-tasks.md) — standalone task list with sorting, voice input, and multi-task creation
