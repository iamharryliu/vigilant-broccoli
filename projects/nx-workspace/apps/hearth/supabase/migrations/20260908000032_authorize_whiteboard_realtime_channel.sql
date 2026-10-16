-- The whiteboards table is RLS-scoped to home members, but the live sync runs
-- over a Supabase Realtime broadcast channel named
-- 'whiteboard-room-<homeId>-<boardKey>', joined as a public channel that
-- bypassed RLS entirely: any holder of the publishable key could enumerate the
-- sequential homeId and subscribe by name to read/broadcast (audit D1).
--
-- The client now joins that room (and its ':cursors' presence sub-channel) as a
-- private channel. These policies authorize the topic on realtime.messages,
-- gating it on membership of the home whose id is embedded in the topic —
-- mirroring the whiteboards table policy (homes owned ∪ accepted memberships).
--
-- The homeId is the third '-'-delimited segment (numeric, right after the
-- 'whiteboard-room-' prefix); the regex guard rejects any topic where that
-- segment is not numeric before the cast. Membership is checked inline against
-- fully-qualified public.homes / public.home_members rather than via
-- is_home_member()/is_home_owner(), which are security-definer functions that
-- do not set their own search_path and so cannot resolve unqualified table
-- names when invoked from a realtime.messages policy.
--
-- RLS on realtime.messages is enabled by default, so this only adds policies.
-- select = receive broadcasts / presence sync; insert = send / track presence.

create policy "whiteboard room: home members can receive"
  on realtime.messages
  for select
  to authenticated
  using (
    realtime.topic() ~ '^whiteboard-room-[0-9]+-'
    and exists (
      select 1 from public.homes h
      where h.id = split_part(realtime.topic(), '-', 3)::integer
        and h.user_id = auth.uid()
      union
      select 1 from public.home_members m
      where m.home_id = split_part(realtime.topic(), '-', 3)::integer
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
      where h.id = split_part(realtime.topic(), '-', 3)::integer
        and h.user_id = auth.uid()
      union
      select 1 from public.home_members m
      where m.home_id = split_part(realtime.topic(), '-', 3)::integer
        and m.user_id = auth.uid()
        and m.status = 'accepted'
    )
  );
