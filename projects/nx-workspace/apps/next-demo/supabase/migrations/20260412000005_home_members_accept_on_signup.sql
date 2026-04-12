create or replace function accept_home_member_invites()
returns trigger as $$
begin
  update home_members
  set user_id = new.id, status = 'accepted'
  where email = new.email
    and status = 'pending';
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert or update of email on auth.users
  for each row execute function accept_home_member_invites();
