import {
  BALLOON_FUSE_TICKS,
  BASE_SPEED,
  ARENA_SIZES,
  MAX_PLAYERS,
  CELL,
  DIRECTION_VECTORS,
  DIRECTIONS,
  POSITION_EPSILON,
  SPEED_STEP,
  SUDDEN_DEATH_INTERVAL_TICKS,
  SUDDEN_DEATH_TICK,
} from './game.consts';
import {
  ArenaSize,
  Balloon,
  Cell,
  Direction,
  MatchState,
  Player,
  Point,
} from './game.types';

export const arenaSizeFor = (players: number): ArenaSize =>
  players <= 4
    ? ARENA_SIZES.SMALL
    : players < MAX_PLAYERS
      ? ARENA_SIZES.MEDIUM
      : ARENA_SIZES.LARGE;

export const spawnPoints = ({ columns, rows }: ArenaSize): Point[] => [
  { x: 1, y: 1 },
  { x: columns - 2, y: rows - 2 },
  { x: columns - 2, y: 1 },
  { x: 1, y: rows - 2 },
  { x: Math.floor(columns / 2), y: 1 },
  { x: Math.floor(columns / 2), y: rows - 2 },
  { x: 1, y: Math.floor(rows / 2) },
  { x: columns - 2, y: Math.floor(rows / 2) },
];

export const cellIndex = (board: ArenaSize, x: number, y: number) =>
  y * board.columns + x;

export const isInside = (board: ArenaSize, x: number, y: number) =>
  x >= 0 && y >= 0 && x < board.columns && y < board.rows;

export const cellAt = (
  board: ArenaSize & { cells: Cell[] },
  x: number,
  y: number,
): Cell =>
  isInside(board, x, y) ? board.cells[cellIndex(board, x, y)] : CELL.WALL;

export const isPillar = (board: ArenaSize, x: number, y: number) =>
  x === 0 ||
  y === 0 ||
  x === board.columns - 1 ||
  y === board.rows - 1 ||
  (x % 2 === 0 && y % 2 === 0);

const spiralOrder = (board: ArenaSize): Point[] => {
  const order: Point[] = [];
  let [left, top, right, bottom] = [1, 1, board.columns - 2, board.rows - 2];
  while (left <= right && top <= bottom) {
    for (let x = left; x <= right; x++) order.push({ x, y: top });
    for (let y = top + 1; y <= bottom; y++) order.push({ x: right, y });
    if (top < bottom) {
      for (let x = right - 1; x >= left; x--) order.push({ x, y: bottom });
    }
    if (left < right) {
      for (let y = bottom - 1; y > top; y--) order.push({ x: left, y });
    }
    [left, top, right, bottom] = [left + 1, top + 1, right - 1, bottom - 1];
  }
  return order.filter(point => !isPillar(board, point.x, point.y));
};

// Sudden death walls the arena in from the outside, one tile at a time, so a
// cautious stalemate on an emptied board still ends.
const spiralCache = new Map<string, Point[]>();

export const suddenDeathOrder = (board: ArenaSize): Point[] => {
  const key = `${board.columns}x${board.rows}`;
  const cached = spiralCache.get(key);
  if (cached) return cached;
  const order = spiralOrder(board);
  spiralCache.set(key, order);
  return order;
};

export const closingTick = (index: number) =>
  SUDDEN_DEATH_TICK + index * SUDDEN_DEATH_INTERVAL_TICKS;

export const closingTileAt = (board: ArenaSize, tick: number): Point | null => {
  const elapsed = tick - SUDDEN_DEATH_TICK;
  if (elapsed < 0 || elapsed % SUDDEN_DEATH_INTERVAL_TICKS !== 0) return null;
  return suddenDeathOrder(board)[elapsed / SUDDEN_DEATH_INTERVAL_TICKS] ?? null;
};

export const balloonAt = (balloons: Balloon[], x: number, y: number) =>
  balloons.find(balloon => balloon.x === x && balloon.y === y);

export const isWalkable = (state: MatchState, x: number, y: number) =>
  cellAt(state, x, y) === CELL.FLOOR && !balloonAt(state.balloons, x, y);

export const step = (point: Point, direction: Direction): Point => ({
  x: point.x + DIRECTION_VECTORS[direction].x,
  y: point.y + DIRECTION_VECTORS[direction].y,
});

export const neighbours = (point: Point) =>
  DIRECTIONS.map(direction => ({ direction, ...step(point, direction) }));

// Players glide freely between tiles; they count as standing on whichever
// tile their centre is over, so splashes, pickups and balloon drops agree
// with what the canvas shows.
export const occupiedTile = (player: Player): Point => ({
  x: Math.round(player.x),
  y: Math.round(player.y),
});

export const isCentered = (player: Player) =>
  Math.abs(player.x - Math.round(player.x)) < POSITION_EPSILON &&
  Math.abs(player.y - Math.round(player.y)) < POSITION_EPSILON;

export const playerSpeed = (player: Player) =>
  BASE_SPEED + player.speedLevel * SPEED_STEP;

export const ticksPerTile = (player: Player) =>
  Math.ceil(1 / playerSpeed(player));

export const splashCells = (
  board: ArenaSize & { cells: Cell[] },
  origin: Point,
  range: number,
): Point[] => {
  const hit: Point[] = [origin];
  DIRECTIONS.forEach(direction => {
    let current: Point = origin;
    for (let distance = 1; distance <= range; distance++) {
      current = step(current, direction);
      const cell = cellAt(board, current.x, current.y);
      if (cell === CELL.WALL) return;
      hit.push(current);
      if (cell === CELL.CRATE) return;
    }
  });
  return hit;
};

// Ticks until each tile is soaked. With `followChains`, a balloon goes off at
// the earliest of its own fuse and any splash that reaches it; without it
// (the easy CPU) chained pops come as a surprise.
export const dangerMap = (
  state: MatchState,
  extraBalloons: Balloon[] = [],
  followChains = true,
) => {
  const danger = new Array<number>(state.cells.length).fill(Infinity);
  state.splashes.forEach(splash => {
    danger[cellIndex(state, splash.x, splash.y)] = 0;
  });

  const balloons = [...state.balloons, ...extraBalloons];
  const detonation = balloons.map(balloon => balloon.fuse);
  let changed = followChains;
  while (changed) {
    changed = false;
    balloons.forEach((balloon, index) => {
      splashCells(state, balloon, balloon.range).forEach(point => {
        balloons.forEach((other, otherIndex) => {
          if (
            other.x === point.x &&
            other.y === point.y &&
            detonation[otherIndex] > detonation[index]
          ) {
            detonation[otherIndex] = detonation[index];
            changed = true;
          }
        });
      });
    });
  }

  balloons.forEach((balloon, index) => {
    splashCells(state, balloon, balloon.range).forEach(point => {
      const cell = cellIndex(state, point.x, point.y);
      danger[cell] = Math.min(danger[cell], detonation[index]);
    });
  });
  suddenDeathOrder(state).forEach((point, index) => {
    const ticksLeft = closingTick(index) - state.tick;
    if (ticksLeft <= 0) return;
    const cell = cellIndex(state, point.x, point.y);
    danger[cell] = Math.min(danger[cell], ticksLeft);
  });
  return danger;
};

export const hypotheticalBalloon = (player: Player, at: Point): Balloon => ({
  id: -1,
  ownerId: player.id,
  x: at.x,
  y: at.y,
  range: player.range,
  fuse: BALLOON_FUSE_TICKS,
});
