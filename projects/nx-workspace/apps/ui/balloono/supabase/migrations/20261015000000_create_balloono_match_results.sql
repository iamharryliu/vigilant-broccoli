-- One row per signed-in player per online-room match. Honor system: each
-- client writes its own row from the state it saw, so the numbers are
-- unverified and spoofable; the CHECKs only cap absurd values. The unique key
-- makes retries and reconnects idempotent (clients insert with
-- ON CONFLICT DO NOTHING). match_id is "<room>:<round id>", identical on
-- every client. Rooms and presence stay anonymous and never touch this table.
create table balloono_match_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null check (char_length(match_id) between 1 and 100),
  mode text not null check (mode in ('online')),
  outcome text not null check (outcome in ('win', 'loss', 'draw')),
  seconds_played integer not null check (seconds_played between 0 and 900),
  balloons_dropped integer not null check (balloons_dropped between 0 and 1000),
  players_soaked integer not null check (players_soaked between 0 and 7),
  items_balloon integer not null check (items_balloon between 0 and 200),
  items_range integer not null check (items_range between 0 and 200),
  items_speed integer not null check (items_speed between 0 and 200),
  created_at timestamptz not null default now(),
  unique (user_id, match_id)
);

alter table balloono_match_results enable row level security;

create policy "balloono_match_results_insert_own"
  on balloono_match_results for insert to authenticated
  with check (user_id = auth.uid());

create policy "balloono_match_results_select_own"
  on balloono_match_results for select to authenticated
  using (user_id = auth.uid());

-- security_invoker keeps the view under the caller's RLS, so each user only
-- ever aggregates their own rows.
create view balloono_user_stats with (security_invoker = true) as
select
  user_id,
  count(*)::integer as matches,
  (count(*) filter (where outcome = 'win'))::integer as wins,
  (count(*) filter (where outcome = 'loss'))::integer as losses,
  (count(*) filter (where outcome = 'draw'))::integer as draws,
  sum(seconds_played)::integer as seconds_played,
  sum(balloons_dropped)::integer as balloons_dropped,
  sum(players_soaked)::integer as players_soaked,
  sum(items_balloon)::integer as items_balloon,
  sum(items_range)::integer as items_range,
  sum(items_speed)::integer as items_speed
from balloono_match_results
group by user_id;

grant select on balloono_user_stats to authenticated;
