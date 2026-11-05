import { CELL, MATCH_STATUS, POWER_UP, TICKS_PER_SECOND } from './game.consts';
import { Contender, MatchState, PlayerInput } from './game.types';
import { advanceMatch, createMatch } from './match';

export const PRACTICE_PLAYER_IDS = ['practice-one', 'practice-two'] as const;
export const PRACTICE_HIT_TICKS = TICKS_PER_SECOND;
const PRACTICE_SIZE = { columns: 9, rows: 7 };

export interface PracticeState {
  match: MatchState;
  hitTicks: Record<string, number>;
}

export const createPractice = (names: string[]): PracticeState => {
  const contenders: Contender[] = PRACTICE_PLAYER_IDS.map((id, index) => ({
    id,
    name: names[index],
    difficulty: null,
  }));
  const match = createMatch(contenders);
  const { columns, rows } = PRACTICE_SIZE;
  return {
    hitTicks: {},
    match: {
      ...match,
      ...PRACTICE_SIZE,
      startCountdown: 0,
      cells: Array.from({ length: columns * rows }, (_, index) => {
        const x = index % columns;
        const y = Math.floor(index / columns);
        if (
          x === 0 ||
          y === 0 ||
          x === columns - 1 ||
          y === rows - 1 ||
          (x % 2 === 0 && y % 2 === 0)
        )
          return CELL.WALL;
        if (y === 3 && (x === 3 || x === 5)) return CELL.CRATE;
        return CELL.FLOOR;
      }),
      hiddenPowerUps: [
        { x: 3, y: 3, type: POWER_UP.RANGE },
        { x: 5, y: 3, type: POWER_UP.BALLOON },
      ],
      powerUps: [{ x: 7, y: 5, type: POWER_UP.SPEED }],
      players: match.players.map((player, index) => ({
        ...player,
        x: 1 + index * 2,
        y: 1,
        range: 2,
        maxBalloons: 2,
      })),
    },
  };
};

export const advancePractice = (
  previous: PracticeState,
  inputs: Record<string, PlayerInput>,
): PracticeState => {
  // A fixed clock disables sudden death and drops old events in this endless
  // sandbox. Movement, collisions, balloon chains and pickups use match rules.
  const match = advanceMatch(
    { ...previous.match, tick: 0, events: [] },
    inputs,
  );
  const hitTicks = Object.fromEntries(
    match.players.map(player => {
      const remaining = Math.max(0, (previous.hitTicks[player.id] ?? 0) - 1);
      return [
        player.id,
        !player.alive && remaining === 0 ? PRACTICE_HIT_TICKS : remaining,
      ];
    }),
  );
  return {
    hitTicks,
    match: {
      ...match,
      status: MATCH_STATUS.PLAYING,
      winnerId: null,
      players: match.players.map(player => ({ ...player, alive: true })),
    },
  };
};
