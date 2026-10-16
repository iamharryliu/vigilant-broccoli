create table grocery_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  position integer not null default 0,
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table grocery_items enable row level security;

create policy "Users can manage grocery items for their homes"
  on grocery_items
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );
