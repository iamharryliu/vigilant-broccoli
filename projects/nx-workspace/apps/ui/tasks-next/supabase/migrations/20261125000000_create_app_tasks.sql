-- Database-backed tasks for tasks-next's Database storage mode. Read and
-- written only through the secret key behind /api/db-tasks, scoped by
-- user_email; RLS with no policies keeps the publishable key out.
create table if not exists app_task_lists (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  title text not null,
  created_at timestamptz not null default now()
);

create index if not exists app_task_lists_user_email_created_at_idx
  on app_task_lists (user_email, created_at);

-- position orders tasks within a list (ascending); a move takes the midpoint
-- of its neighbours, so it is a float rather than a dense rank.
create table if not exists app_tasks (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references app_task_lists (id) on delete cascade,
  user_email text not null,
  title text not null,
  notes text,
  due text,
  status text not null default 'needsAction'
    check (status in ('needsAction', 'completed')),
  completed_at timestamptz,
  position double precision not null,
  updated_at timestamptz not null default now()
);

create index if not exists app_tasks_list_id_position_idx
  on app_tasks (list_id, position);

alter table app_task_lists enable row level security;
alter table app_tasks enable row level security;
