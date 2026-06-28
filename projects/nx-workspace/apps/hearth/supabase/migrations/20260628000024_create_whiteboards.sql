create table whiteboards (
  id uuid primary key default gen_random_uuid(),
  home_id bigint not null unique references homes(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now()
);

alter table whiteboards enable row level security;

create policy "Users can manage whiteboards for their homes"
  on whiteboards
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

alter publication supabase_realtime add table whiteboards;
