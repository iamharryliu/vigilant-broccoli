-- Kanban board setup (boards, lane order, per-list sort modes) for tasks-next's
-- Google and Database storage modes. One row per user and store, because each
-- store has its own task list ids. Read and written only through the secret
-- key behind /api/kanban/boards; RLS with no policies keeps the publishable
-- key out. Local mode keeps its boards in the browser.
create table if not exists app_kanban_boards (
  user_email text not null,
  store text not null check (store in ('google', 'database')),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_email, store)
);

alter table app_kanban_boards enable row level security;
