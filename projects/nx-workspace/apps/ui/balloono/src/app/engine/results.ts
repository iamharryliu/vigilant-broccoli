import { MATCH_STATUS, POWER_UP, TICKS_PER_SECOND } from './game.consts';
import { MatchState } from './game.types';

export const MATCH_MODE = {
  ONLINE: 'online',
} as const;

export const OUTCOME = {
  WIN: 'win',
  LOSS: 'loss',
  DRAW: 'draw',
} as const;

type Outcome = (typeof OUTCOME)[keyof typeof OUTCOME];

// Column-for-column with `balloono_match_results`.
export interface MatchResult {
  match_id: string;
  mode: (typeof MATCH_MODE)[keyof typeof MATCH_MODE];
  outcome: Outcome;
  seconds_played: number;
  balloons_dropped: number;
  players_soaked: number;
  items_balloon: number;
  items_range: number;
  items_speed: number;
}

const outcomeOf = (match: MatchState, userId: string): Outcome => {
  if (match.status !== MATCH_STATUS.OVER) return OUTCOME.LOSS;
  if (!match.winnerId) return OUTCOME.DRAW;
  return match.winnerId === userId ? OUTCOME.WIN : OUTCOME.LOSS;
};

// Every client derives the same match id from the room and the round id, so a
// retry or a second device can only ever collide on the unique key.
export const buildMatchResult = (
  room: string,
  match: MatchState,
  userId: string,
): MatchResult | null => {
  const player = match.players.find(item => item.id === userId);
  if (!player) return null;
  const { tally } = player;
  return {
    match_id: `${room}:${match.id}`,
    mode: MATCH_MODE.ONLINE,
    // A match still running when the player leaves is a loss.
    outcome: outcomeOf(match, userId),
    seconds_played: Math.ceil(tally.ticksAlive / TICKS_PER_SECOND),
    balloons_dropped: tally.balloonsDropped,
    players_soaked: tally.soaks,
    items_balloon: tally.pickups[POWER_UP.BALLOON],
    items_range: tally.pickups[POWER_UP.RANGE],
    items_speed: tally.pickups[POWER_UP.SPEED],
  };
};
