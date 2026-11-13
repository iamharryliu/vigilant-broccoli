# Tasks

## Overview

The home page's Tasks tab (`src/app/components/TaskList.tsx`) lists the selected home's pending recurring instances followed by its one-off tasks and completed instances, shared by every accepted member. On mobile the same list is the `/tasks` page, reached from the Home group in the sidebar.

- Recurring tasks repeat weekly on chosen weekdays or monthly on chosen ordinal weekdays (`1st`-`4th` and `Last`, e.g. "1st & 3rd Mon"), set by the Repeat selector in `TaskManagerDialog`; each occurrence is its own instance. A date is a monthly task's occurrence when its weekday is chosen and its week of the month, `ceil(dayOfMonth / 7)`, is chosen, with `Last` matching the final seven days of the month. A task has at most one pending instance: it appears on a scheduled day after the latest completion (or its creation date), stays listed, labelled `(missed <date>)`, until completed even on unscheduled days, and after completion the next one appears on the next scheduled day. A completed instance stays in Completed indefinitely, like completed one-off tasks, and unchecking it removes that completion. Completed rows (instances and one-off tasks) are grouped under `CheckList`'s day headers by when they were completed (the completion's `created_at` or the task's `completed_at`), newest first, not by the instance's occurrence date; instances completed on an earlier day are left out of today's progress. Deleting a recurring task archives it (`archived_at`): it leaves the list and Manage tasks, but its completed instances stay in Completed under its title.
- One-off tasks are added inline, renamed by clicking them and deleted from the row's ellipsis menu.
- Every row's ellipsis menu has Assign, which opens `AssignTaskDialog` listing the home's accepted members (owner included) plus Unassigned. Any member can assign any task to one member; the row then shows a badge with the assignee's `display_name`, falling back to email. An assignee no longer in the home gets no badge.
- Recurring assignment is per occurrence: the task's `assigned_user_id` belongs to its pending instance. Completing it copies the assignee onto the completion row and clears the task, so the next occurrence starts unassigned. Assigning a completed instance changes only that completion; unchecking one deletes it without restoring its assignee onto the task.
- Drag-to-reorder works within the same kind; recurring tasks without a pending instance keep their place.
- On first load and on a home switch the list shows `ChecklistSkeleton` (shaped like a dense row, with assignee badges) instead of "No tasks due today", which appears only once the fetch has resolved.
- Adding, completing and reopening animate like mobile-manager's tasks through `CheckList`'s [completion contract](../../../../libs/@vigilant-broccoli/react-lib/docs/features/checklist-completion.md). A recurring instance changes id when completed (task id → temporary id → saved completion id) or reopened, so `TaskList` records each replacement in `transitionFrom` and passes it as `transitionFromId`. Each toggle is optimistic, its row is `isRemoving` while the write is pending (`usePendingWrites`), and a failed write restores the previous state.
- A new home starts with no tasks. The Manage tasks dialog has Export and Import: Export downloads the home's tasks as `recurring-tasks.json`, a list of `{ title, days, monthlyNth? }` (`toDefaultTask`), and Import accepts such a file or pasted JSON. The default set is tracked in `src/app/components/default-recurring-tasks.json`, in the same shape; import it to seed a home, and replace it with an export to promote a home's tasks to the defaults. Import matches by title: it updates an existing task's schedule, adds the rest and orders the list like the file, with tasks the file omits kept after them. It never deletes, and a matching archived task is restored.
- The former localStorage keys (`home:recurring-tasks`, `home:recurring-tasks-done`, `home:one-off-tasks`) are not imported; the component removes them from the browser.

## Data

- `home_recurring_tasks`: `id`, `home_id`, `title`, `days` (`smallint[]`, 0 = Sunday as `Date.getDay`), `monthly_nth` (nullable `smallint[]` of 1-4 and -1 for last, non-empty when set; null repeats weekly), `position`, `assigned_user_id`, `archived_at` (nullable; set by delete, cleared when an import lists the title again)
- `home_recurring_task_completions`: `id`, `task_id` (cascade delete), `home_id`, `date` (client-local `YYYY-MM-DD`), `created_at`, `assigned_user_id`, unique (`task_id`, `date`)
- `home_one_off_tasks`: checklist shape (`name`, `completed`, `completed_at`, `position`, `home_id`) plus `assigned_user_id`

Every `assigned_user_id` is a nullable `auth.users` reference that is set null when the user is deleted.

Every table is exported under the Tasks option of [Export Data](./export-data.md).

## Routes

- `GET /api/tasks/recurring?homeId=` — list by `position`, archived tasks included with `archivedAt` set (the client titles completed history from them)
- `POST /api/tasks/recurring` — create (`homeId`, `title`, `days`, optional `monthlyNth`), appended last; tasks return `monthlyNth` (null when weekly)
- `PATCH /api/tasks/recurring` — update `title`/`days`/`monthlyNth`/`assignedUserId` (null clears) by `id`, or reorder with `order: [{ id, position }]`
- `DELETE /api/tasks/recurring` — archive by `id` (sets `archived_at`, clears the assignee); the row and its completions remain
- `POST /api/tasks/recurring/import` — `homeId`, `tasks: [{ title, days, monthlyNth? }]`; update-by-title or add, ordered like `tasks`; returns the list
- `GET /api/tasks/completions?homeId=` — every completion of the home as `{ id, taskId, date, completedAt, assignedUserId }` (`completedAt` is `created_at`), by `date`
- `POST /api/tasks/completions` — set (`completed: true`: copies the task's assignee onto the completion, clears it on the task, returns the completion) or clear a completion for `taskId` on `date`
- `PATCH /api/tasks/completions` — set one completion's `assignedUserId` (null clears) by `id`
- `/api/tasks/one-off` — `createChecklistHandlers` with `assignable: true` (`GET`, `POST`, `PATCH`, `DELETE`), so items carry `assignedUserId` and `PATCH` accepts it
- `GET /api/homes/[id]/members` — assignee choices: accepted rows with a `user_id`, labelled by `display_name`

## RLS

All three tables allow full CRUD to the home owner and accepted members via the `homes` + `home_members` subquery policy, matching `kitchen_chore_items`. Completions take `home_id` from the task read through RLS, not from the request.
