# Tasks

## Overview

The home page's Tasks tab (`src/app/components/TaskList.tsx`) lists the selected home's recurring tasks due today followed by its one-off tasks, shared by every accepted member. On mobile the same list is the `/tasks` page, reached from the Home group in the sidebar.

- Recurring tasks repeat on chosen weekdays and are managed in `TaskManagerDialog`; a check-off counts for the member's local day only, so the task reappears unchecked the next day it is due.
- One-off tasks are added inline, renamed by clicking them and deleted from the row's ellipsis menu.
- Every row's ellipsis menu has Assign, which opens `AssignTaskDialog` listing the home's accepted members (owner included) plus Unassigned. Any member can assign any task to one member; the row then shows a badge with the assignee's `display_name`, falling back to email. An assignee no longer in the home gets no badge.
- Drag-to-reorder works within the same kind; recurring tasks not due today keep their place.
- A new home starts with no tasks. Only the dev-only "Reset recurring tasks to default" button loads `DEFAULT_TASKS` from `tasks.utils.ts`, replacing the home's recurring tasks.
- The former localStorage keys (`home:recurring-tasks`, `home:recurring-tasks-done`, `home:one-off-tasks`) are not imported; the component removes them from the browser.

## Data

- `home_recurring_tasks`: `id`, `home_id`, `title`, `days` (`smallint[]`, 0 = Sunday as `Date.getDay`), `position`, `assigned_user_id`
- `home_recurring_task_completions`: `id`, `task_id` (cascade delete), `home_id`, `date` (client-local `YYYY-MM-DD`), unique (`task_id`, `date`)
- `home_one_off_tasks`: checklist shape (`name`, `completed`, `completed_at`, `position`, `home_id`) plus `assigned_user_id`

`assigned_user_id` is a nullable `auth.users` reference that is set null when the user is deleted.

Every table is exported under the Tasks option of [Export Data](./export-data.md).

## Routes

- `GET /api/tasks/recurring?homeId=` — list by `position`
- `POST /api/tasks/recurring` — create (`homeId`, `title`, `days`), appended last
- `PATCH /api/tasks/recurring` — update `title`/`days`/`assignedUserId` (null clears) by `id`, or reorder with `order: [{ id, position }]`
- `DELETE /api/tasks/recurring` — delete by `id`
- `POST /api/tasks/recurring/reset` — replace a home's recurring tasks with the defaults
- `GET /api/tasks/completions?homeId=&date=` — ids of recurring tasks completed on `date`
- `POST /api/tasks/completions` — set (`completed: true`) or clear a completion for `taskId` on `date`
- `/api/tasks/one-off` — `createChecklistHandlers` with `assignable: true` (`GET`, `POST`, `PATCH`, `DELETE`), so items carry `assignedUserId` and `PATCH` accepts it
- `GET /api/homes/[id]/members` — assignee choices: accepted rows with a `user_id`, labelled by `display_name`

## RLS

All three tables allow full CRUD to the home owner and accepted members via the `homes` + `home_members` subquery policy, matching `kitchen_chore_items`. Completions take `home_id` from the task read through RLS, not from the request.
