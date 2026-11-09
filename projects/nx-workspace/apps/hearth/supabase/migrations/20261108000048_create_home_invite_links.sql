-- Shareable join links. Only a SHA-256 hash of each token is stored, so a
-- leaked table read cannot be replayed as a link; the raw token exists only in
-- the URL returned once at creation.

-- Same pattern as is_home_owner(): a security definer lookup so policies can
-- check the caller's role without re-entering home_members RLS.
create or replace function public.is_home_admin(p_home_id integer)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from home_members
    where home_members.home_id = p_home_id
      and home_members.user_id = auth.uid()
      and home_members.status = 'accepted'
      and home_members.role = 'HOME_ADMIN'
  );
$$;

create table home_invite_links (
  id uuid primary key default gen_random_uuid(),
  home_id integer not null references homes(id) on delete cascade,
  token_hash text not null unique,
  -- A link can never grant admin; promotion stays an explicit role change.
  role text not null default 'HOME_MEMBER' check (role = 'HOME_MEMBER'),
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '7 days',
  max_uses integer not null default 10 check (max_uses > 0),
  use_count integer not null default 0 check (use_count >= 0 and use_count <= max_uses),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index home_invite_links_home_id_idx on home_invite_links (home_id);

alter table home_invite_links enable row level security;

create policy "home owner or admin can read invite links"
  on home_invite_links for select
  to authenticated
  using (is_home_owner(home_id) or is_home_admin(home_id));

create policy "home owner or admin can create invite links"
  on home_invite_links for insert
  to authenticated
  with check (
    (is_home_owner(home_id) or is_home_admin(home_id))
    and created_by = auth.uid()
  );

-- Revocation sets revoked_at; no delete policy, so revoked rows stay as an
-- audit trail until the home itself is deleted.
create policy "home owner or admin can revoke invite links"
  on home_invite_links for update
  to authenticated
  using (is_home_owner(home_id) or is_home_admin(home_id))
  with check (is_home_owner(home_id) or is_home_admin(home_id));

-- Redeems a link for p_user_id in one transaction: the row lock serializes
-- concurrent joins on the same link, so use_count can never pass max_uses.
-- Existing members and the owner return already_member without using a slot.
-- Callable only by the service role: p_user_id is trusted, verified by the
-- POST /api/join/[token] route before it calls this.
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

  -- A pending email invite for the same address becomes this accepted row.
  insert into public.home_members (
    home_id, email, user_id, status, role, invited_by, invited_by_email
  )
  values (
    v_link.home_id, v_email, p_user_id, 'accepted', v_link.role,
    v_link.created_by, v_inviter_email
  )
  on conflict (home_id, email) do update
    set user_id = excluded.user_id,
        status = excluded.status,
        role = excluded.role,
        invited_by = excluded.invited_by,
        invited_by_email = excluded.invited_by_email;

  return jsonb_build_object('status', 'joined', 'home_id', v_link.home_id);
end;
$$;

revoke execute on function public.redeem_home_invite_link(text, uuid) from public, anon, authenticated;
grant execute on function public.redeem_home_invite_link(text, uuid) to service_role;
