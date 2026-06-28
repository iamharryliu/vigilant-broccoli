create table household_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  position integer not null default 0,
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table household_rules enable row level security;

create policy "Users can manage household rules for their homes"
  on household_rules
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );
