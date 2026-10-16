-- #489 scoped the notepad *table* reads to the allowed account, but the live
-- sync runs over a Supabase Realtime broadcast channel ('notepad-room'), which
-- was joined as a public channel and so bypassed RLS entirely: any holder of
-- the publishable key could subscribe by name and read/broadcast (audit D1).
--
-- The client now joins 'notepad-room' (and its ':cursors' presence sub-channel)
-- as a *private* channel. Supabase enforces authorization for private channels
-- via RLS on realtime.messages, keyed on realtime.topic(). These policies grant
-- that topic only to the allowed account, mirroring the table policy in
-- 20260818000000. Public channels (the standalone whiteboard app, findme) are
-- unaffected — realtime.messages RLS applies only to private channels.
--
-- RLS on realtime.messages is enabled by default on Supabase projects, so this
-- only adds policies. select = receive broadcasts / presence sync;
-- insert = send broadcasts / track presence.

create policy "notepad room: allowed account can receive"
  on realtime.messages
  for select
  to authenticated
  using (
    realtime.topic() in ('notepad-room', 'notepad-room:cursors')
    and lower(auth.email()) = 'harryliu1995@gmail.com'
  );

create policy "notepad room: allowed account can send"
  on realtime.messages
  for insert
  to authenticated
  with check (
    realtime.topic() in ('notepad-room', 'notepad-room:cursors')
    and lower(auth.email()) = 'harryliu1995@gmail.com'
  );
