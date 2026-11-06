create table home_recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  home_id bigint not null references homes(id) on delete cascade,
  title text not null,
  days smallint[] not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- `date` is the member's local day, sent by the client, so a check-off only
-- counts for the day it was made in that member's timezone.
create table home_recurring_task_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references home_recurring_tasks(id) on delete cascade,
  home_id bigint not null references homes(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (task_id, date)
);

create table home_one_off_tasks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  position integer not null default 0,
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per home once the default recurring tasks were seeded, so deleting
-- every recurring task does not re-seed them and concurrent first loads seed
-- only once (the insert that wins the primary key seeds).
create table home_recurring_task_seeds (
  home_id bigint primary key references homes(id) on delete cascade,
  seeded_at timestamptz not null default now()
);

create index home_recurring_task_completions_home_date_idx
  on home_recurring_task_completions (home_id, date);

alter table home_recurring_tasks enable row level security;
alter table home_recurring_task_completions enable row level security;
alter table home_one_off_tasks enable row level security;
alter table home_recurring_task_seeds enable row level security;

create policy "Users can manage recurring tasks for their homes"
  on home_recurring_tasks
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

create policy "Users can manage recurring task completions for their homes"
  on home_recurring_task_completions
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

create policy "Users can manage one-off tasks for their homes"
  on home_one_off_tasks
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

create policy "Users can manage recurring task seeds for their homes"
  on home_recurring_task_seeds
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );
