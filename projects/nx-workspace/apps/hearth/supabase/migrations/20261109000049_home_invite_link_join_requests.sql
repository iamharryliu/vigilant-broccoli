-- Join requests: a link with requires_approval creates a pending home_members
-- row that an owner or admin must approve, instead of an accepted one.

alter table home_invite_links
  add column requires_approval boolean not null default false;

-- 'invited' rows were created by an owner/admin for a specific email; the
-- invitee may accept them. 'requested' rows were created by the person asking
-- to join through a link, so only an owner/admin may accept them.
alter table home_members
  add column origin text not null default 'invited'
    check (origin in ('invited', 'requested'));

-- A requester must not be able to approve themselves, so every self-accept
-- path is limited to rows an owner/admin invited.
drop policy if exists "invited user can accept own invite" on home_members;

create policy "invited user can accept own invite"
  on home_members for update
  to authenticated
  using (
    email = auth.email() and status = 'pending' and origin = 'invited'
  )
  with check (
    user_id = auth.uid() and email = auth.email() and status = 'accepted'
  );

create or replace function public.protect_home_member_invite_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if exists (
    select 1
    from public.homes h
    where h.id = old.home_id and h.user_id = auth.uid()
  ) then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.home_id is distinct from old.home_id
    or new.email is distinct from old.email
    or new.invited_by is distinct from old.invited_by
    or new.invited_by_email is distinct from old.invited_by_email
    or new.role is distinct from old.role
    or new.origin is distinct from old.origin
    or new.created_at is distinct from old.created_at
  then
    raise exception 'accepting an invite may only change status and user_id';
  end if;

  return new;
end;
$$;

-- Same body as 20261102000041 plus the origin filter: a pending join request
-- for an address must not auto-accept when that address later signs up or
-- changes email.
create or replace function public.accept_home_member_invites()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.home_members
  set user_id = new.id, status = 'accepted'
  where email = new.email and status = 'pending' and origin = 'invited';
  return new;
exception
  when undefined_table then
    return new;
  when others then
    raise warning 'accept_home_member_invites failed for user % (SQLSTATE %): %', new.id, sqlstate, sqlerrm;
    return new;
end;
$$;

-- Adds the 'requested' result. A request uses one slot, so the cap also bounds
-- how many requests a link can collect; a repeat click while a request is
-- pending is idempotent and uses none. A pending email invite for the same
-- address is accepted directly, because an admin already approved that email.
create or replace function public.redeem_home_invite_link(
  p_token_hash text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_link public.home_invite_links%rowtype;
  v_email text;
  v_inviter_email text;
  v_pending_origin text;
begin
  select * into v_link
    from public.home_invite_links
    where token_hash = p_token_hash
    for update;
  if not found then
    return jsonb_build_object('status', 'invalid');
  end if;

  select lower(email) into v_email from auth.users where id = p_user_id;
  if v_email is null then
    return jsonb_build_object('status', 'invalid');
  end if;

  if exists (
    select 1 from public.homes
    where id = v_link.home_id and user_id = p_user_id
  ) or exists (
    select 1 from public.home_members
    where home_id = v_link.home_id
      and status = 'accepted'
      and (user_id = p_user_id or email = v_email)
  ) then
    return jsonb_build_object('status', 'already_member', 'home_id', v_link.home_id);
  end if;

  select origin into v_pending_origin
    from public.home_members
    where home_id = v_link.home_id
      and status = 'pending'
      and (user_id = p_user_id or email = v_email)
    order by (origin = 'invited') desc
    limit 1;
  if v_pending_origin = 'requested' then
    return jsonb_build_object('status', 'requested', 'home_id', v_link.home_id);
  end if;

  update public.home_invite_links
    set use_count = use_count + 1
    where id = v_link.id
      and use_count < max_uses
      and revoked_at is null
      and expires_at > now();
  if not found then
    return jsonb_build_object(
      'status',
      case
        when v_link.revoked_at is not null then 'revoked'
        when v_link.expires_at <= now() then 'expired'
        else 'exhausted'
      end
    );
  end if;

  select email into v_inviter_email from auth.users where id = v_link.created_by;

  if v_link.requires_approval and v_pending_origin is null then
    insert into public.home_members (
      home_id, email, user_id, status, role, origin, invited_by, invited_by_email
    )
    values (
      v_link.home_id, v_email, p_user_id, 'pending', v_link.role, 'requested',
      v_link.created_by, v_inviter_email
    )
    on conflict (home_id, email) do nothing;

    return jsonb_build_object('status', 'requested', 'home_id', v_link.home_id);
  end if;

  insert into public.home_members (
    home_id, email, user_id, status, role, origin, invited_by, invited_by_email
  )
  values (
    v_link.home_id, v_email, p_user_id, 'accepted', v_link.role, 'invited',
    v_link.created_by, v_inviter_email
  )
  on conflict (home_id, email) do update
    set user_id = excluded.user_id,
        status = excluded.status,
        role = excluded.role,
        origin = excluded.origin,
        invited_by = excluded.invited_by,
        invited_by_email = excluded.invited_by_email;

  return jsonb_build_object('status', 'joined', 'home_id', v_link.home_id);
end;
$$;

revoke execute on function public.redeem_home_invite_link(text, uuid) from public, anon, authenticated;
grant execute on function public.redeem_home_invite_link(text, uuid) to service_role;
