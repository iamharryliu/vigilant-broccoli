create table receipt_merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  home_id bigint not null references homes(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (home_id, normalized_name)
);

create table receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  home_id bigint not null references homes(id) on delete cascade,
  merchant_id uuid references receipt_merchants(id) on delete set null,
  purchased_at date not null,
  currency text not null default 'CAD',
  -- European VAT is already contained in the printed line prices, so total is
  -- the sum of the lines and tax is a component of it. North American sales tax
  -- is added on top, making total = subtotal + tax. This flag disambiguates.
  tax_inclusive boolean not null default true,
  subtotal numeric(10, 2),
  tax numeric(10, 2),
  total numeric(10, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table receipt_items (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references receipts(id) on delete cascade,
  price_item_id uuid references price_items(id) on delete set null,
  name text not null,
  category text,
  unit text,
  quantity numeric(10, 3) not null default 1,
  unit_price numeric(10, 2),
  total_price numeric(10, 2) not null,
  line_order int not null default 0,
  created_at timestamptz not null default now()
);

-- One row per rate band in the receipt's tax summary table (e.g. a Swedish
-- "Moms%" block listing 25% on household goods and 6% on food separately).
create table receipt_taxes (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references receipts(id) on delete cascade,
  rate numeric(5, 2) not null,
  tax_amount numeric(10, 2),
  net_amount numeric(10, 2),
  gross_amount numeric(10, 2),
  created_at timestamptz not null default now()
);

create table receipt_images (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references receipts(id) on delete cascade,
  r2_key text not null,
  mime_type text not null,
  sort_order int not null default 0
);

create index receipts_home_purchased_at_idx
  on receipts (home_id, purchased_at desc);
create index receipt_items_receipt_id_idx on receipt_items (receipt_id);
create index receipt_items_price_item_id_idx on receipt_items (price_item_id);
create index receipt_images_receipt_id_idx on receipt_images (receipt_id);
create index receipt_taxes_receipt_id_idx on receipt_taxes (receipt_id);

alter table receipt_merchants enable row level security;
alter table receipts enable row level security;
alter table receipt_items enable row level security;
alter table receipt_images enable row level security;
alter table receipt_taxes enable row level security;

create policy "Users can manage receipt merchants for their homes"
  on receipt_merchants
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

create policy "Users can manage receipts for their homes"
  on receipts
  for all
  using (
    home_id in (
      select id from homes where user_id = auth.uid()
      union
      select home_id from home_members where user_id = auth.uid() and status = 'accepted'
    )
  );

create policy "Users can manage receipt items via receipts"
  on receipt_items
  for all
  using (
    exists (
      select 1 from receipts
      where receipts.id = receipt_items.receipt_id
        and receipts.home_id in (
          select id from homes where user_id = auth.uid()
          union
          select home_id from home_members where user_id = auth.uid() and status = 'accepted'
        )
    )
  );

create policy "Users can manage receipt images via receipts"
  on receipt_images
  for all
  using (
    exists (
      select 1 from receipts
      where receipts.id = receipt_images.receipt_id
        and receipts.home_id in (
          select id from homes where user_id = auth.uid()
          union
          select home_id from home_members where user_id = auth.uid() and status = 'accepted'
        )
    )
  );

create policy "Users can manage receipt taxes via receipts"
  on receipt_taxes
  for all
  using (
    exists (
      select 1 from receipts
      where receipts.id = receipt_taxes.receipt_id
        and receipts.home_id in (
          select id from homes where user_id = auth.uid()
          union
          select home_id from home_members where user_id = auth.uid() and status = 'accepted'
        )
    )
  );
