-- create_receipt inserted price_entries in the same statement as the CTE that
-- upserts price_items. Everything in one statement sees one snapshot, so the
-- just-upserted product was invisible to the price_entries RLS check
-- (`exists (select 1 from price_items where id = item_id ...)`), and the insert
-- was rejected with "new row violates row-level security policy".
--
-- Splitting the writes into separate statements lets each one see the previous
-- statement's rows, while staying inside the same transaction.

create or replace function receipt_payload_items(payload jsonb)
returns table (
  name text,
  normalized_name text,
  original_name text,
  category text,
  unit text,
  quantity numeric,
  unit_price numeric,
  total_price numeric,
  line_order int
)
language sql
immutable
as $$
  select
    btrim(elem->>'name'),
    normalize_receipt_name(elem->>'name'),
    nullif(btrim(elem->>'originalName'), ''),
    nullif(btrim(elem->>'category'), ''),
    nullif(btrim(elem->>'unit'), ''),
    coalesce((elem->>'quantity')::numeric, 1),
    nullif(elem->>'unitPrice', '')::numeric,
    (elem->>'totalPrice')::numeric,
    (ord - 1)::int
  from jsonb_array_elements(coalesce(payload->'items', '[]'::jsonb))
    with ordinality as t(elem, ord);
$$;

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

  -- Statement 1: one upsert resolves every product, new or already known.
  insert into price_items (name, normalized_name, category, unit, home_id, user_id)
  select distinct on (i.normalized_name)
    i.name, i.normalized_name, i.category, i.unit, v_home_id, v_user_id
  from receipt_payload_items(payload) i
  order by i.normalized_name
  on conflict (home_id, normalized_name) do update
    set updated_at = now();

  -- Statement 2: the products above are now visible, so the join resolves and
  -- the RLS checks on these child rows can see their parents.
  insert into receipt_items (
    receipt_id, price_item_id, name, original_name, category, unit,
    quantity, unit_price, total_price, line_order
  )
  select
    v_receipt_id,
    p.id,
    i.name,
    coalesce(i.original_name, i.name),
    i.category,
    i.unit,
    i.quantity,
    i.unit_price,
    i.total_price,
    i.line_order
  from receipt_payload_items(payload) i
  join price_items p
    on p.home_id = v_home_id
   and p.normalized_name = i.normalized_name;

  -- Statement 3: unit price keeps history comparable across pack sizes.
  insert into price_entries (item_id, price, store, purchased_at)
  select
    p.id,
    coalesce(i.unit_price, i.total_price),
    v_merchant_name,
    v_purchased_at
  from receipt_payload_items(payload) i
  join price_items p
    on p.home_id = v_home_id
   and p.normalized_name = i.normalized_name;

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

grant execute on function receipt_payload_items(jsonb) to authenticated;
grant execute on function create_receipt(jsonb) to authenticated;
