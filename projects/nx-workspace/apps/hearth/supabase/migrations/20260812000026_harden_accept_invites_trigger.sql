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
exception when others then
  return new;
end;
$$;
