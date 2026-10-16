-- Saving a receipt used to be ~3 round trips per line item (look up the price
-- item, maybe insert it, insert a price entry) plus separate inserts for the
-- receipt, its items and its taxes — none of them atomic, so a failure partway
-- left an orphan receipt. This collapses the whole write into one function.

create or replace function normalize_receipt_name(value text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(btrim(coalesce(value, '')), '\s+', ' ', 'g'));
$$;

-- Matching price items by ilike meant a scan per line item and no way to upsert.
alter table price_items add column if not exists normalized_name text;

update price_items
  set normalized_name = normalize_receipt_name(name)
  where normalized_name is null;

-- Existing rows may already hold case/whitespace variants of the same product,
-- which would block the unique index. Keep the oldest of each group and repoint
-- its children before dropping the losers. Each statement recomputes the groups
-- so none of this depends on a temp table surviving between statements.
update price_entries
  set item_id = d.keeper_id
  from (
    select id, keeper_id from (
      select
        id,
        first_value(id) over (
          partition by home_id, normalize_receipt_name(name)
          order by created_at, id
        ) as keeper_id
      from price_items
    ) ranked
    where id <> keeper_id
  ) d
  where price_entries.item_id = d.id;

update receipt_items
  set price_item_id = d.keeper_id
  from (
    select id, keeper_id from (
      select
        id,
        first_value(id) over (
          partition by home_id, normalize_receipt_name(name)
          order by created_at, id
        ) as keeper_id
      from price_items
    ) ranked
    where id <> keeper_id
  ) d
  where receipt_items.price_item_id = d.id;

delete from price_items
  where id in (
    select id from (
      select
        id,
        first_value(id) over (
          partition by home_id, normalize_receipt_name(name)
          order by created_at, id
        ) as keeper_id
      from price_items
    ) ranked
    where id <> keeper_id
  );

alter table price_items alter column normalized_name set not null;

create unique index if not exists price_items_home_normalized_name_idx
  on price_items (home_id, normalized_name);

-- Lets a retried or double-submitted save resolve to the receipt it already
-- created instead of inserting a second one.
alter table receipts add column if not exists idempotency_key text;

create unique index if not exists receipts_home_idempotency_key_idx
  on receipts (home_id, idempotency_key)
  where idempotency_key is not null;

create or replace function create_receipt(payload jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_home_id bigint := (payload->>'homeId')::bigint;
  v_user_id uuid := (payload->>'userId')::uuid;
  v_merchant_name text := nullif(btrim(payload->>'merchantName'), '');
  v_merchant_address text := nullif(btrim(payload->>'merchantAddress'), '');
  v_purchased_at date := (payload->>'purchasedAt')::date;
  v_idempotency_key text := nullif(payload->>'idempotencyKey', '');
  v_merchant_id uuid;
  v_receipt_id uuid;
begin
  if v_idempotency_key is not null then
    select id into v_receipt_id
      from receipts
      where home_id = v_home_id
        and idempotency_key = v_idempotency_key;
    if v_receipt_id is not null then
      return v_receipt_id;
    end if;
  end if;

  if v_merchant_name is not null then
    insert into receipt_merchants (
      name, normalized_name, address, home_id, user_id
    )
    values (
      v_merchant_name,
      normalize_receipt_name(v_merchant_name),
      v_merchant_address,
      v_home_id,
      v_user_id
    )
    on conflict (home_id, normalized_name) do update
      set address = coalesce(excluded.address, receipt_merchants.address),
          updated_at = now()
    returning id into v_merchant_id;
  end if;

  insert into receipts (
    user_id, home_id, merchant_id, purchased_at, currency, tax_inclusive,
    subtotal, tax, total, notes, idempotency_key
  )
  values (
    v_user_id,
    v_home_id,
    v_merchant_id,
    v_purchased_at,
    coalesce(payload->>'currency', 'CAD'),
    coalesce((payload->>'taxInclusive')::boolean, true),
    nullif(payload->>'subtotal', '')::numeric,
    nullif(payload->>'tax', '')::numeric,
    nullif(payload->>'total', '')::numeric,
    nullif(btrim(payload->>'notes'), ''),
    v_idempotency_key
  )
  returning id into v_receipt_id;

  with incoming as (
    select
      btrim(elem->>'name') as name,
      normalize_receipt_name(elem->>'name') as normalized_name,
      nullif(btrim(elem->>'originalName'), '') as original_name,
      nullif(btrim(elem->>'category'), '') as category,
      nullif(btrim(elem->>'unit'), '') as unit,
      coalesce((elem->>'quantity')::numeric, 1) as quantity,
      nullif(elem->>'unitPrice', '')::numeric as unit_price,
      (elem->>'totalPrice')::numeric as total_price,
      (ord - 1)::int as line_order
    from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb))
      with ordinality as t(elem, ord)
  ),
  -- One upsert covers both new and already-known products, and returns the id
  -- either way, which is what removes the per-item lookup.
  upserted as (
    insert into price_items (name, normalized_name, category, unit, home_id, user_id)
    select distinct on (normalized_name)
      name, normalized_name, category, unit, v_home_id, v_user_id
    from incoming
    order by normalized_name
    on conflict (home_id, normalized_name) do update
      set updated_at = now()
    returning id, normalized_name
  ),
  inserted_items as (
    insert into receipt_items (
      receipt_id, price_item_id, name, original_name, category, unit,
      quantity, unit_price, total_price, line_order
    )
    select
      v_receipt_id,
      u.id,
      i.name,
      coalesce(i.original_name, i.name),
      i.category,
      i.unit,
      i.quantity,
      i.unit_price,
      i.total_price,
      i.line_order
    from incoming i
    join upserted u on u.normalized_name = i.normalized_name
    returning 1
  )
  -- Unit price keeps history comparable across different pack sizes.
  insert into price_entries (item_id, price, store, purchased_at)
  select
    u.id,
    coalesce(i.unit_price, i.total_price),
    v_merchant_name,
    v_purchased_at
  from incoming i
  join upserted u on u.normalized_name = i.normalized_name;

  insert into receipt_taxes (
    receipt_id, rate, tax_amount, net_amount, gross_amount
  )
  select
    v_receipt_id,
    coalesce((elem->>'rate')::numeric, 0),
    nullif(elem->>'taxAmount', '')::numeric,
    nullif(elem->>'netAmount', '')::numeric,
    nullif(elem->>'grossAmount', '')::numeric
  from jsonb_array_elements(coalesce(payload->'taxes', '[]'::jsonb)) as elem;

  return v_receipt_id;
end;
$$;

grant execute on function normalize_receipt_name(text) to authenticated;
grant execute on function create_receipt(jsonb) to authenticated;
