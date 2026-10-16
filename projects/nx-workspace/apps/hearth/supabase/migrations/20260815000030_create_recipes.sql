create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  markdown text not null,
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table recipes enable row level security;

create policy "Users can manage recipes for their homes"
  on recipes
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );
