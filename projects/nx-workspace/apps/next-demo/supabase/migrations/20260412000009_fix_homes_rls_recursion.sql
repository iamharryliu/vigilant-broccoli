-- Break the circular RLS dependency:
-- homes policy queries home_members, home_members policy queries homes → infinite recursion
-- Fix: use a security definer function to check home ownership without triggering homes RLS

create or replace function is_home_owner(p_home_id integer)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from homes
    where homes.id = p_home_id
    and homes.user_id = auth.uid()
  );
$$;

drop policy if exists "home owner can manage members" on home_members;

create policy "home owner can manage members"
  on home_members for all
  to authenticated
  using (is_home_owner(home_id))
  with check (is_home_owner(home_id));
