# Settings

The `/settings` page, opened from the settings icon in the home header (shown when signed in or in local mode). Signed-out visitors see a sign-in prompt instead.

- **Task lists:** create, rename (inline; Enter saves, Escape cancels) and delete (after confirmation) through `/api/tasks/lists` `POST`/`PATCH`/`DELETE`. The first list is the default, which Google refuses to delete, so its delete is disabled in both modes. `useTaskLists` in `src/app/hooks/use-task-lists.ts` holds one list state for this card and the export card, updating it only after the API confirms.
- **Export task lists:** one checkbox per task list, with Select all and Clear all. Export fetches each selected list's tasks through `/api/tasks?taskListId=<id>` (no status filter, so completed tasks are included) and downloads `tasks-export-<YYYY-MM-DD>.json` shaped `{ exportedAt, taskLists: [{ id, title, tasks }] }`.
- **Account:** Sign out, then return to the home page. `/embed` has no settings link and keeps its own sign-in flow.

In local mode both list cards act on the browser's local lists.

## Local mode

Two entry points set the `tasks-local-mode` flag in `libs/local-mode.ts`: "Continue without signing in" on the signed-out tasks card (`onUseLocally` on `GoogleTasksComponent`), and the incognito toggle beside the settings icon. While it is set, the home page passes `localTasksAuth`, built with `createLocalTasksAdapter` from `react-lib-tasks`, whose `authFetch` answers the same `/api/tasks*` calls from the `tasks-local-store` localStorage key, so nothing reaches the server or Google. Voice and image parsing are not served locally.

Local mode never signs the user out: the Supabase session stays, so a signed-in user leaves through the toggle or Settings' Leave local mode without signing in again. Signed-out users get Sign in with Google, which clears the flag before redirecting. Local tasks stay in the browser and are not copied to Google; choosing local mode again shows them. Both modes share the component's remembered list (`STORAGE_KEY_SELECTED_TASK_LIST`), so `setLocalMode` clears it on every switch: Google rejects a local list id and `/api/tasks` returns "Failed to fetch tasks".
