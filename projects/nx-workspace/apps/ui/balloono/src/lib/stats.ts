import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { supabase } from './supabase';
import { MatchResult } from '../app/engine/results';

const REST_PATH = '/rest/v1';
const RESULTS_TABLE = 'balloono_match_results';
const TOTALS_VIEW = 'balloono_user_stats';

export interface UserStats {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  seconds_played: number;
  balloons_dropped: number;
  players_soaked: number;
  items_balloon: number;
  items_range: number;
  items_speed: number;
}

const restUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}${REST_PATH}/${path}`;

const headers = (accessToken: string) => ({
  apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${accessToken}`,
  [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
});

// Plain fetch with `keepalive` instead of supabase-js: leaving a match is
// recorded from `pagehide`, where an ordinary request is cancelled with the
// page. `ignore-duplicates` turns a repeat of the same (user, match) into a
// no-op, so retries and reconnects never double-count.
export const saveMatchResult = async (
  accessToken: string,
  userId: string,
  result: MatchResult,
) => {
  const response = await fetch(
    restUrl(`${RESULTS_TABLE}?on_conflict=user_id,match_id`),
    {
      method: HTTP_METHOD.POST,
      keepalive: true,
      headers: {
        ...headers(accessToken),
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({ ...result, user_id: userId }),
    },
  );
  if (!response.ok) throw new Error(String(response.status));
};

export const fetchUserStats = async (
  accessToken: string,
): Promise<UserStats | null> => {
  const response = await fetch(restUrl(`${TOTALS_VIEW}?select=*`), {
    headers: headers(accessToken),
  });
  if (!response.ok) return null;
  const rows = (await response.json()) as UserStats[];
  return rows[0] ?? null;
};

export interface LeaderboardEntry {
  rank: number;
  player_code: string;
  matches: number;
  wins: number;
  players_soaked: number;
}

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase.rpc('balloono_leaderboard');
  if (error) throw error;
  return data as LeaderboardEntry[];
};
