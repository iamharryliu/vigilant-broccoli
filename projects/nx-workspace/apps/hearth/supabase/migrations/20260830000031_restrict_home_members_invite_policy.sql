-- The "invited user can view and accept invite" policy was FOR ALL with only
-- a USING clause and no WITH CHECK. Postgres reuses USING as the write check,
-- so any authenticated user could INSERT a home_members row with an arbitrary
-- home_id as long as user_id/email matched themselves, self-granting
-- 'accepted' membership -- and full read/write via is_home_member -- to any
-- home without an invite ever being issued. homes.id is a sequential serial
-- and the Supabase auth pool is shared across hearth, vb-manager-next,
-- vb-manager-next-mobile and employee-handler-ui, so any account from any of
-- those apps could reach any home's private data.

drop policy if exists "invited user can view and accept invite" on home_members;

-- Reading your own invite rows is unchanged from the old policy.
create policy "invited user can view own invite"
  on home_members for select
  to authenticated
  using (user_id = auth.uid() or email = auth.email());

-- Accepting an invite may only flip an existing pending row addressed to your
-- own email to accepted, bound to your own uid -- exactly what
-- src/app/api/auth/accept-invites/route.ts issues. No INSERT or DELETE policy
-- is granted: creating and removing membership rows stays owner-only via
-- "home owner can manage members".
create policy "invited user can accept own invite"
  on home_members for update
  to authenticated
  using (email = auth.email() and status = 'pending')
  with check (
    user_id = auth.uid() and email = auth.email() and status = 'accepted'
  );

-- WITH CHECK cannot stop home_id/email/invited_by/role from being smuggled
-- into the same UPDATE that performs the pending->accepted transition, so pin
-- every column except status/user_id for that path.
create or replace function public.protect_home_member_invite_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Trusted server-side paths run without a JWT (auth.uid() is null): the
  -- service-role client behind the members API's role/invite management, and
  -- the security-definer accept_home_member_invites trigger on auth.users.
  -- Both are authorized in application code before they reach this table.
  if auth.uid() is null then
    return new;
  end if;

  -- Home owners manage members through the owner policy. Checked inline with
  -- fully-qualified names rather than via is_home_owner(), which does not set
  -- its own search_path and so cannot resolve `homes` when called from here.
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
    or new.created_at is distinct from old.created_at
  then
    raise exception 'accepting an invite may only change status and user_id';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_home_member_invite_columns on public.home_members;

create trigger protect_home_member_invite_columns
  before update on public.home_members
  for each row
  execute function public.protect_home_member_invite_columns();
