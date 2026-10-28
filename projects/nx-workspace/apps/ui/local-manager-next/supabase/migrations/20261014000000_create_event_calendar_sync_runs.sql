-- One row per sync run (CLI or UI-started) so failures are visible after the
-- fact instead of only in a discarded terminal. updated_at is the run's
-- heartbeat: a 'running' row whose process died stops updating and is shown
-- as stale. current_calendar_id lets the UI mark the calendar a CLI run is
-- working on. Written and read only through the service-role key
-- (supabaseAdmin) via the app's API, so RLS has no policies.
create table event_calendar_sync_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  updated_at timestamptz not null default now(),
  trigger text not null check (trigger in ('cli', 'ui')),
  status text not null default 'running'
    check (status in ('running', 'success', 'partial', 'failed')),
  current_calendar_id text,
  results jsonb not null default '[]'::jsonb
);

create index idx_event_calendar_sync_runs_started_at
  on event_calendar_sync_runs(started_at desc);

alter table event_calendar_sync_runs enable row level security;
