create table home_members (
  id uuid primary key default gen_random_uuid(),
  home_id integer not null references homes(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz default now(),
  unique (home_id, email)
);

alter table home_members enable row level security;

-- Home owner can manage members
create policy "home owner can manage members"
  on home_members for all
  to authenticated
  using (
    exists (
      select 1 from homes
      where homes.id = home_members.home_id
      and homes.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from homes
      where homes.id = home_members.home_id
      and homes.user_id = auth.uid()
    )
  );

-- Invited user can read and accept their own invite
create policy "invited user can view and accept invite"
  on home_members for all
  to authenticated
  using (user_id = auth.uid() or email = auth.email());
