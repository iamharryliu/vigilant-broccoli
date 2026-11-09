-- Postgres evaluates every permissive policy on realtime.messages for each
-- private-channel check and does not guarantee `and` short-circuits, so the
-- `split_part(realtime.topic(), '-', 3)::integer` cast from 20260908000032 ran
-- on other topics too. For 'notepad-room' it cast '' and errored ("invalid
-- input syntax for type integer"), which Realtime reports as Unauthorized, so
-- local-manager-next and mobile-manager-next could never join their notepad
-- room. Comparing as text keeps the same match without a cast that can fail.

drop policy "whiteboard room: home members can receive" on realtime.messages;
drop policy "whiteboard room: home members can send" on realtime.messages;

create policy "whiteboard room: home members can receive"
  on realtime.messages
  for select
  to authenticated
  using (
    realtime.topic() ~ '^whiteboard-room-[0-9]+-'
    and exists (
      select 1 from public.homes h
      where h.id::text = split_part(realtime.topic(), '-', 3)
        and h.user_id = auth.uid()
      union
      select 1 from public.home_members m
      where m.home_id::text = split_part(realtime.topic(), '-', 3)
        and m.user_id = auth.uid()
        and m.status = 'accepted'
    )
  );

create policy "whiteboard room: home members can send"
  on realtime.messages
  for insert
  to authenticated
  with check (
    realtime.topic() ~ '^whiteboard-room-[0-9]+-'
    and exists (
      select 1 from public.homes h
      where h.id::text = split_part(realtime.topic(), '-', 3)
        and h.user_id = auth.uid()
      union
      select 1 from public.home_members m
      where m.home_id::text = split_part(realtime.topic(), '-', 3)
        and m.user_id = auth.uid()
        and m.status = 'accepted'
    )
  );
