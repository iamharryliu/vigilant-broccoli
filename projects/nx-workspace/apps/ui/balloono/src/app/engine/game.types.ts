import {
  CELL,
  DIFFICULTY,
  DIRECTION,
  MATCH_STATUS,
  MATCH_EVENT,
  POWER_UP,
} from './game.consts';

export type Cell = (typeof CELL)[keyof typeof CELL];
export type Direction = (typeof DIRECTION)[keyof typeof DIRECTION];
export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];
export type PowerUpType = (typeof POWER_UP)[keyof typeof POWER_UP];
export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

export interface Point {
  x: number;
  y: number;
}

export interface PowerUp extends Point {
  type: PowerUpType;
}

// Kept on the player (not beside the match) so it travels in every snapshot
// and a new host or late guest reconstructs it.
export interface PlayerTally {
  balloonsDropped: number;
  soaks: number;
  pickups: Record<PowerUpType, number>;
  ticksAlive: number;
}

export interface Player {
  id: string;
  name: string;
  slot: number;
  difficulty: Difficulty | null;
  x: number;
  y: number;
  facing: Direction;
  alive: boolean;
  maxBalloons: number;
  range: number;
  speedLevel: number;
  tally: PlayerTally;
}

export interface Balloon extends Point {
  id: number;
  ownerId: string;
  range: number;
  fuse: number;
}

export interface Splash extends Point {
  ttl: number;
  // Owners of the balloons that started each chain reaching this tile; each is credited if it soaks someone.
  ownerIds: string[];
}

export interface ArenaSize {
  columns: number;
  rows: number;
}

export interface MatchEvent {
  id: number;
  tick: number;
  type: (typeof MATCH_EVENT)[keyof typeof MATCH_EVENT];
}

export interface MatchState extends ArenaSize {
  id: string;
  events: MatchEvent[];
  nextEventId: number;
  tick: number;
  cells: Cell[];
  hiddenPowerUps: PowerUp[];
  powerUps: PowerUp[];
  players: Player[];
  balloons: Balloon[];
  splashes: Splash[];
  nextBalloonId: number;
  status: MatchStatus;
  winnerId: string | null;
}

export interface PlayerInput {
  direction: Direction | null;
  placeBalloon: boolean;
  // Stops at the next tile centre instead of gliding past it; CPU bots only
  // think on tile centres.
  snap?: boolean;
}

export interface Contender {
  id: string;
  name: string;
  difficulty: Difficulty | null;
}
