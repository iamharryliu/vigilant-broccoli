create table price_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  home_id bigint not null references homes(id) on delete cascade,
  name text not null,
  category text,
  unit text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table price_entries (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references price_items(id) on delete cascade,
  price numeric(10, 2) not null,
  store text,
  purchased_at date not null,
  created_at timestamptz not null default now()
);

alter table price_items enable row level security;
alter table price_entries enable row level security;

create policy "Users can manage price items for their homes"
  on price_items
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

create policy "Users can manage price entries via price items"
  on price_entries
  for all
  using (
    exists (
      select 1 from price_items
      where price_items.id = price_entries.item_id
        and price_items.home_id in (
          select id from homes where user_id = auth.uid()
          union
          select home_id from home_members where user_id = auth.uid() and status = 'accepted'
        )
    )
  );
