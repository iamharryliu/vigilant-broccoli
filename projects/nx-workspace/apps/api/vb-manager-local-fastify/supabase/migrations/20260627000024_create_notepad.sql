create table notepad (
  id text primary key default 'singleton',
  content text not null default '',
  updated_at timestamptz not null default now()
);

insert into notepad (id) values ('singleton');

alter publication supabase_realtime add table notepad;

alter table notepad enable row level security;

create policy "Anyone can read notepad"
  on notepad
  for select
  using (true);
