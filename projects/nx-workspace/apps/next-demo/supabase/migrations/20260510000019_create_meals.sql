create table meals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  servings integer,
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table meals enable row level security;

create policy "Users can manage meals for their homes"
  on meals
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

alter table calendar_events
  add column meal_id uuid references meals(id) on delete set null;
