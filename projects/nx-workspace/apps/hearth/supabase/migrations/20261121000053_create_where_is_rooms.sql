create table where_is_rooms (
  id uuid primary key default gen_random_uuid(),
  home_id integer not null references homes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create index where_is_rooms_home_id_idx on where_is_rooms(home_id);
create unique index where_is_rooms_home_id_name_key
  on where_is_rooms(home_id, lower(name));

alter table where_is_rooms enable row level security;

create policy "owner can manage where_is_rooms"
  on where_is_rooms for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "home members can manage where_is_rooms"
  on where_is_rooms for all
  to authenticated
  using (is_home_member(home_id) or is_home_owner(home_id))
  with check (is_home_member(home_id) or is_home_owner(home_id));

-- Set null so deleting a room leaves its storage areas unassigned.
alter table where_is_items
  add column room_id uuid references where_is_rooms(id) on delete set null;

create index where_is_items_room_id_idx on where_is_items(room_id);
