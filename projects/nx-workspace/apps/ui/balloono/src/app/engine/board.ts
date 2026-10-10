import {
  BALLOON_FUSE_TICKS,
  BASE_SPEED,
  BOARD_COLUMNS,
  BOARD_ROWS,
  CELL,
  DIRECTION_VECTORS,
  DIRECTIONS,
  SPEED_STEP,
  SUDDEN_DEATH_INTERVAL_TICKS,
  SUDDEN_DEATH_TICK,
} from './game.consts';
import {
  Balloon,
  Cell,
  Direction,
  MatchState,
  Player,
  Point,
} from './game.types';

export const cellIndex = (x: number, y: number) => y * BOARD_COLUMNS + x;

export const isInside = (x: number, y: number) =>
  x >= 0 && y >= 0 && x < BOARD_COLUMNS && y < BOARD_ROWS;

export const cellAt = (cells: Cell[], x: number, y: number): Cell =>
  isInside(x, y) ? cells[cellIndex(x, y)] : CELL.WALL;

export const isPillar = (x: number, y: number) =>
  x === 0 ||
  y === 0 ||
  x === BOARD_COLUMNS - 1 ||
  y === BOARD_ROWS - 1 ||
  (x % 2 === 0 && y % 2 === 0);

const spiralOrder = (): Point[] => {
  const order: Point[] = [];
  let [left, top, right, bottom] = [1, 1, BOARD_COLUMNS - 2, BOARD_ROWS - 2];
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
  return order.filter(point => !isPillar(point.x, point.y));
};

// Sudden death walls the arena in from the outside, one tile at a time, so a
// cautious stalemate on an emptied board still ends.
export const SUDDEN_DEATH_ORDER = spiralOrder();

export const closingTick = (index: number) =>
  SUDDEN_DEATH_TICK + index * SUDDEN_DEATH_INTERVAL_TICKS;

export const closingTileAt = (tick: number): Point | null => {
  const elapsed = tick - SUDDEN_DEATH_TICK;
  if (elapsed < 0 || elapsed % SUDDEN_DEATH_INTERVAL_TICKS !== 0) return null;
  return SUDDEN_DEATH_ORDER[elapsed / SUDDEN_DEATH_INTERVAL_TICKS] ?? null;
};

export const balloonAt = (balloons: Balloon[], x: number, y: number) =>
  balloons.find(balloon => balloon.x === x && balloon.y === y);

export const isWalkable = (state: MatchState, x: number, y: number) =>
  cellAt(state.cells, x, y) === CELL.FLOOR && !balloonAt(state.balloons, x, y);

export const step = (point: Point, direction: Direction): Point => ({
  x: point.x + DIRECTION_VECTORS[direction].x,
  y: point.y + DIRECTION_VECTORS[direction].y,
});

export const neighbours = (point: Point) =>
  DIRECTIONS.map(direction => ({ direction, ...step(point, direction) }));

// A player mid-step is counted on whichever tile they are mostly over, so
// splashes, pickups and balloon drops agree with what the canvas shows.
export const occupiedTile = (player: Player): Point =>
  player.progress >= 0.5
    ? { x: player.x, y: player.y }
    : { x: player.fromX, y: player.fromY };

export const playerSpeed = (player: Player) =>
  BASE_SPEED + player.speedLevel * SPEED_STEP;

export const ticksPerTile = (player: Player) =>
  Math.ceil(1 / playerSpeed(player));

export const splashCells = (
  cells: Cell[],
  origin: Point,
  range: number,
): Point[] => {
  const hit: Point[] = [origin];
  DIRECTIONS.forEach(direction => {
    let current: Point = origin;
    for (let distance = 1; distance <= range; distance++) {
      current = step(current, direction);
      const cell = cellAt(cells, current.x, current.y);
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
    danger[cellIndex(splash.x, splash.y)] = 0;
  });

  const balloons = [...state.balloons, ...extraBalloons];
  const detonation = balloons.map(balloon => balloon.fuse);
  let changed = followChains;
  while (changed) {
    changed = false;
    balloons.forEach((balloon, index) => {
      splashCells(state.cells, balloon, balloon.range).forEach(point => {
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
    splashCells(state.cells, balloon, balloon.range).forEach(point => {
      const cell = cellIndex(point.x, point.y);
      danger[cell] = Math.min(danger[cell], detonation[index]);
    });
  });
  SUDDEN_DEATH_ORDER.forEach((point, index) => {
    const ticksLeft = closingTick(index) - state.tick;
    if (ticksLeft <= 0) return;
    const cell = cellIndex(point.x, point.y);
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
