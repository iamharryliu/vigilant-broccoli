-- Expose bounded rankings only; own-user RLS still protects match details.
create function public.balloono_leaderboard()
returns table (rank bigint, player_code text, matches bigint, wins bigint, players_soaked bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with totals as (
    select user_id, count(*) as matches,
      count(*) filter (where outcome = 'win') as wins,
      sum(players_soaked) as players_soaked
    from public.balloono_match_results
    group by user_id
  )
  select row_number() over (order by wins desc, players_soaked desc, user_id),
    left(md5(user_id::text), 12), matches, wins, players_soaked
  from totals
  order by wins desc, players_soaked desc, user_id
  limit 50;
$$;

revoke all on function public.balloono_leaderboard() from public;
grant execute on function public.balloono_leaderboard() to anon, authenticated;
