drop policy if exists "invited user can view and accept invite" on home_members;

create policy "invited user can view and accept invite"
  on home_members for all
  to authenticated
  using (user_id = auth.uid() or email = auth.email());
