create table resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  quantity integer not null default 1,
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table resources enable row level security;

create policy "Users can manage resources for their homes"
  on resources
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

create table resource_bookings (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references resources(id) on delete cascade,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  home_id bigint not null references homes(id) on delete cascade,
  calendar_event_id uuid references calendar_events(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_date_range check (end_date >= start_date)
);

alter table resource_bookings enable row level security;

create policy "Users can manage resource bookings for their homes"
  on resource_bookings
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );
