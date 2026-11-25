-- local-manager-next's copy of tasks-next's kanban board store, so a
-- self-hosted project gets the table without tasks-next's migrations. A no-op
-- on the shared project, where 20261125000100_create_app_kanban_boards.sql
-- already created it. Read and written only through the secret key; RLS with
-- no policies keeps the publishable key out.
create table if not exists app_kanban_boards (
  user_email text not null,
  store text not null check (store in ('google', 'database')),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_email, store)
);

alter table app_kanban_boards enable row level security;
