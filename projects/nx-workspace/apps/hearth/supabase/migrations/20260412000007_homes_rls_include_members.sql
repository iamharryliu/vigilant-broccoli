drop policy "users can manage their own homes" on homes;

-- Owners can manage their own homes
create policy "owners can manage their own homes"
  on homes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Members can read homes they have been accepted into
create policy "members can read their homes"
  on homes for select
  to authenticated
  using (
    exists (
      select 1 from home_members
      where home_members.home_id = homes.id
      and home_members.user_id = auth.uid()
      and home_members.status = 'accepted'
    )
  );
