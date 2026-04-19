create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start timestamptz not null,
  "end" timestamptz not null,
  all_day boolean not null default false,
  color text,
  google_event_id text,
  home_id bigint not null references homes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table calendar_events enable row level security;

create policy "Users can manage events for their homes"
  on calendar_events
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );
