-- Moves event-calendar tracking off per-machine SQLite into shared Supabase so
-- every machine reads the same tracked list (previously a calendar created on
-- one machine showed up as "untracked" on another). Written only through the
-- service-role key (supabaseAdmin); the read policies exist so the browser's
-- realtime subscription — on the publishable key — receives row changes.
create table event_calendars (
  id text primary key,
  name text not null,
  google_calendar_id text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_synced_at timestamptz,
  last_sync_message text
);

create table event_calendar_sources (
  id bigint generated always as identity primary key,
  calendar_id text not null references event_calendars(id) on delete cascade,
  url text not null,
  source_type text not null
);

create index idx_event_calendar_sources_calendar_id
  on event_calendar_sources(calendar_id);

alter publication supabase_realtime add table event_calendars;
alter publication supabase_realtime add table event_calendar_sources;

alter table event_calendars enable row level security;
alter table event_calendar_sources enable row level security;

create policy "Anyone can read event_calendars"
  on event_calendars
  for select
  using (true);

create policy "Anyone can read event_calendar_sources"
  on event_calendar_sources
  for select
  using (true);
