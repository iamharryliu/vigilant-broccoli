-- The original "using (true)" policies let anyone holding the public
-- publishable/anon key read notepad and event-calendars data directly via
-- Supabase's REST/Realtime API, bypassing the apps' Google-sign-in + email
-- allowlist entirely (see libs/auth-policy.ts). Scoping to the signed-in
-- JWT's email keeps the browser's realtime subscription working for the
-- allowed account while blocking anonymous/public reads. Writes were never
-- covered by these policies — they only ever went through the service-role
-- key (supabaseAdmin) — so this only tightens SELECT.
drop policy "Anyone can read notepad" on notepad;

create policy "Only the allowed account can read notepad"
  on notepad
  for select
  using (lower(auth.email()) = 'harryliu1995@gmail.com');

drop policy "Anyone can read event_calendars" on event_calendars;

create policy "Only the allowed account can read event_calendars"
  on event_calendars
  for select
  using (lower(auth.email()) = 'harryliu1995@gmail.com');

drop policy "Anyone can read event_calendar_sources" on event_calendar_sources;

create policy "Only the allowed account can read event_calendar_sources"
  on event_calendar_sources
  for select
  using (lower(auth.email()) = 'harryliu1995@gmail.com');
