create or replace function public.accept_home_member_invites()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.home_members
  set user_id = new.id, status = 'accepted'
  where email = new.email and status = 'pending';
  return new;
exception
  -- The original signup blocker: home_members not resolvable from the auth role's search_path.
  when undefined_table then
    return new;
  -- Signup must still succeed, but the invite stays pending, so leave a trace in the logs.
  when others then
    raise warning 'accept_home_member_invites failed for user % (SQLSTATE %): %', new.id, sqlstate, sqlerrm;
    return new;
end;
$$;
