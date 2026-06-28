create table where_is_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table where_is_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references where_is_items(id) on delete cascade,
  r2_key text not null,
  mime_type text not null,
  sort_order int default 0
);

alter table where_is_items enable row level security;
alter table where_is_images enable row level security;

create policy "users manage their own where_is_items"
  on where_is_items for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage their own where_is_images"
  on where_is_images for all
  to authenticated
  using (
    exists (
      select 1 from where_is_items
      where where_is_items.id = where_is_images.item_id
        and where_is_items.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from where_is_items
      where where_is_items.id = where_is_images.item_id
        and where_is_items.user_id = auth.uid()
    )
  );
