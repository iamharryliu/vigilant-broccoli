create table home_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  status text not null default 'Todo',
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table home_projects enable row level security;

create policy "Users can manage home projects for their homes"
  on home_projects
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

alter table calendar_events
  add column project_id uuid references home_projects(id) on delete set null;
