create table homes (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now()
);

alter table homes enable row level security;

create policy "users can manage their own homes"
  on homes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
