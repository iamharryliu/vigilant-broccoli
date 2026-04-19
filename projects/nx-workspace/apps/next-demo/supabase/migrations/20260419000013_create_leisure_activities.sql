create table leisure_activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table leisure_activities enable row level security;

create policy "Users can manage leisure activities for their homes"
  on leisure_activities
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );
