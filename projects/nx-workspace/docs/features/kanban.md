# Kanban Board

## Overview

- Google Tasks-backed swimlane board in `vb-manager-next`
- Boards and lane order persisted in `localStorage`
- Requires Google OAuth session

## Data Model

- **Board** — named container with ordered lanes
- **Lane** — maps to a Google Tasks task list
- **Task** — individual Google Task item within a lane

## Features

### Boards

- Create, rename (double-click), delete boards
- Drag to reorder boards in sidebar
- Sidebar collapsible

### Task Lists

- Manage Task Lists dialog (☰ button in sidebar header) for viewing all Google Task lists
- Rename lists (double-click or edit button) via Google Tasks API PATCH
- Delete lists with confirmation (permanently deletes from Google, removes associated lanes from all boards)
- Create new list from the Add Lane dialog (+ Create new list)

### Lanes

- Add lane by selecting a Google Tasks list (each list usable once per board)
- Option to create a new Google Tasks list inline when adding a lane
- Remove lanes
- Drag handle in header to reorder; reorder is tracked in local state during drag and committed on drop
- Dragging lane resolves target by `taskListId` since `over` may be a task item droppable inside the lane, not the lane itself

### Tasks

- Drag tasks between lanes (creates in target first, then deletes from source)
- Drag to reorder within same lane (calls `/api/tasks/move` with previous task ID)
- Lane highlights on hover when dragging a task; non-target lanes show subtle drop zone hint
- Blue drop indicator bar shows between tasks during reorder

## State

- Board config: `localStorage` keys `swimlanes-boards`, `swimlanes-active-board`
- Task data: fetched from Google Tasks API via `/api/tasks`, `/api/tasks/lists` (GET, POST, PATCH, DELETE)

## Drag Overlays

- Task: shows title, notes preview, due date, commit type badge, Eisenhower quadrant color
- Lane: header with skeleton task placeholders
- Board: compact sidebar-style chip with blue accent

## Constraints

- A task list can only appear once per board
- Requires authenticated session to load task lists

## Reference

- [Google Tasks](./google-tasks.md) — standalone task list with sorting, voice input, and multi-task creation
