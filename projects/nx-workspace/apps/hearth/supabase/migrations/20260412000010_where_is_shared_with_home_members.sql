-- Allow home members (accepted) to access where_is_items in their shared homes

create or replace function is_home_member(p_home_id integer)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from home_members
    where home_members.home_id = p_home_id
      and home_members.user_id = auth.uid()
      and home_members.status = 'accepted'
  );
$$;

drop policy if exists "users manage their own where_is_items" on where_is_items;

-- Owner can do everything
create policy "owner can manage where_is_items"
  on where_is_items for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Home members can read and manage items in homes they belong to
create policy "home members can manage where_is_items"
  on where_is_items for all
  to authenticated
  using (is_home_member(home_id) or is_home_owner(home_id))
  with check (is_home_member(home_id) or is_home_owner(home_id));

drop policy if exists "users manage their own where_is_images" on where_is_images;

create policy "home members can manage where_is_images"
  on where_is_images for all
  to authenticated
  using (
    exists (
      select 1 from where_is_items
      where where_is_items.id = where_is_images.item_id
        and (is_home_member(where_is_items.home_id) or is_home_owner(where_is_items.home_id) or where_is_items.user_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from where_is_items
      where where_is_items.id = where_is_images.item_id
        and (is_home_member(where_is_items.home_id) or is_home_owner(where_is_items.home_id) or where_is_items.user_id = auth.uid())
    )
  );
