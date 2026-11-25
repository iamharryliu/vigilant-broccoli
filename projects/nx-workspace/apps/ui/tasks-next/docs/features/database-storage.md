# Database storage

A third storage mode beside Google Tasks and Local: tasks and lists live in the shared Supabase project, scoped to the signed-in user's email.

- **Modes:** `libs/storage-mode.ts` holds the active mode (`google`, `local` or `database`) under `tasks-storage-mode`. A pre-existing `tasks-local-mode=true` flag still reads as local until the next switch. The home header's icon select (Google, Database, Local; signed-in or local users) switches modes; the Settings header badge shows the active one.
- **Contract:** `libs/db-tasks-auth.ts` rewrites the component's `/api/tasks*` calls to `/api/db-tasks*`, which `libs/db-tasks.ts` serves with the same request and response shapes as the Google routes and the local adapter, so `GoogleTasksComponent`, Settings, export and import run unchanged. Database mode still requires the Google sign-in (Supabase auth identifies the user).
- **Tables:** `app_task_lists` and `app_tasks` (`supabase/migrations/20261125000000_create_app_tasks.sql`), created by the deploy's migration step. RLS has no policies: only the secret key behind the routes reads or writes them, always filtered by `user_email`. Deleting a list cascades to its tasks.
- **Behaviour:** the first request creates a "My Tasks" list. Unknown list ids (`@default` or another mode's id) resolve to the first list. New tasks go to the front; `app_tasks.position` is a float so a move takes the midpoint of its neighbours. Any list can be deleted while another remains, and the default list is the Settings preference, as in local mode.
