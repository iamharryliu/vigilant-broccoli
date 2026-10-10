import {
  balloonAt,
  cellIndex,
  closingTileAt,
  isPillar,
  isWalkable,
  occupiedTile,
  playerSpeed,
  splashCells,
  step,
} from './board';
import {
  BALLOON_FUSE_TICKS,
  BOARD_COLUMNS,
  BOARD_ROWS,
  CELL,
  CRATE_DENSITY,
  DIRECTION,
  MATCH_STATUS,
  MAX_BALLOONS,
  MAX_RANGE,
  MAX_SPEED_LEVEL,
  NO_INPUT,
  OPPOSITE_DIRECTION,
  POWER_UP,
  POWER_UP_CHANCE,
  POWER_UP_TYPES,
  SPAWN_POINTS,
  SPLASH_TICKS,
  STARTING_BALLOONS,
  STARTING_RANGE,
} from './game.consts';
import {
  Cell,
  Contender,
  MatchState,
  Player,
  PlayerInput,
  Point,
  PowerUp,
} from './game.types';

const SPAWN_CLEARANCE = 1;

const isNearSpawn = (x: number, y: number) =>
  SPAWN_POINTS.some(
    spawn =>
      (spawn.x === x && Math.abs(spawn.y - y) <= SPAWN_CLEARANCE) ||
      (spawn.y === y && Math.abs(spawn.x - x) <= SPAWN_CLEARANCE),
  );

const randomItem = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const createBoard = () => {
  const cells: Cell[] = [];
  const hiddenPowerUps: PowerUp[] = [];
  for (let y = 0; y < BOARD_ROWS; y++) {
    for (let x = 0; x < BOARD_COLUMNS; x++) {
      if (isPillar(x, y)) {
        cells.push(CELL.WALL);
        continue;
      }
      if (isNearSpawn(x, y) || Math.random() > CRATE_DENSITY) {
        cells.push(CELL.FLOOR);
        continue;
      }
      cells.push(CELL.CRATE);
      if (Math.random() < POWER_UP_CHANCE) {
        hiddenPowerUps.push({ x, y, type: randomItem(POWER_UP_TYPES) });
      }
    }
  }
  return { cells, hiddenPowerUps };
};

const createPlayer = (contender: Contender, slot: number): Player => {
  const spawn = SPAWN_POINTS[slot];
  return {
    ...contender,
    slot,
    x: spawn.x,
    y: spawn.y,
    fromX: spawn.x,
    fromY: spawn.y,
    progress: 0,
    facing: DIRECTION.DOWN,
    alive: true,
    maxBalloons: STARTING_BALLOONS,
    range: STARTING_RANGE,
    speedLevel: 0,
  };
};

export const createMatch = (contenders: Contender[]): MatchState => ({
  tick: 0,
  ...createBoard(),
  powerUps: [],
  players: contenders.map(createPlayer),
  balloons: [],
  splashes: [],
  nextBalloonId: 1,
  status: MATCH_STATUS.PLAYING,
  winnerId: null,
});

const tryStartMove = (
  state: MatchState,
  player: Player,
  input: PlayerInput,
  budget: number,
) => {
  if (!input.direction) return;
  player.facing = input.direction;
  const target = step(player, input.direction);
  if (!isWalkable(state, target.x, target.y)) return;
  player.fromX = player.x;
  player.fromY = player.y;
  player.x = target.x;
  player.y = target.y;
  player.progress = budget;
};

const movePlayer = (state: MatchState, player: Player, input: PlayerInput) => {
  const speed = playerSpeed(player);
  if (player.progress === 0) {
    tryStartMove(state, player, input, speed);
    return;
  }
  // Reversing mid-step is allowed so a player can back out of a splash lane.
  if (input.direction === OPPOSITE_DIRECTION[player.facing]) {
    [player.x, player.fromX] = [player.fromX, player.x];
    [player.y, player.fromY] = [player.fromY, player.y];
    player.progress = 1 - player.progress;
    player.facing = input.direction;
  }
  player.progress += speed;
  if (player.progress < 1) return;
  const leftover = player.progress - 1;
  player.progress = 0;
  player.fromX = player.x;
  player.fromY = player.y;
  if (leftover > 0) tryStartMove(state, player, input, leftover);
};

const placeBalloon = (state: MatchState, player: Player) => {
  const owned = state.balloons.filter(
    balloon => balloon.ownerId === player.id,
  ).length;
  if (owned >= player.maxBalloons) return;
  const tile = occupiedTile(player);
  if (balloonAt(state.balloons, tile.x, tile.y)) return;
  state.balloons.push({
    id: state.nextBalloonId++,
    ownerId: player.id,
    x: tile.x,
    y: tile.y,
    range: player.range,
    fuse: BALLOON_FUSE_TICKS,
  });
};

const applyPowerUp = (player: Player, powerUp: PowerUp) => {
  if (powerUp.type === POWER_UP.BALLOON) {
    player.maxBalloons = Math.min(MAX_BALLOONS, player.maxBalloons + 1);
  }
  if (powerUp.type === POWER_UP.RANGE) {
    player.range = Math.min(MAX_RANGE, player.range + 1);
  }
  if (powerUp.type === POWER_UP.SPEED) {
    player.speedLevel = Math.min(MAX_SPEED_LEVEL, player.speedLevel + 1);
  }
};

const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

const popBalloons = (state: MatchState) => {
  const queue = state.balloons.filter(balloon => balloon.fuse <= 0);
  const popped = new Set<number>();
  const soaked: Point[] = [];
  const cratesHit: Point[] = [];

  while (queue.length) {
    const balloon = queue.shift() as (typeof queue)[number];
    if (popped.has(balloon.id)) continue;
    popped.add(balloon.id);
    splashCells(state.cells, balloon, balloon.range).forEach(point => {
      soaked.push(point);
      if (state.cells[cellIndex(point.x, point.y)] === CELL.CRATE) {
        cratesHit.push(point);
      }
      const chained = balloonAt(state.balloons, point.x, point.y);
      if (chained && !popped.has(chained.id)) queue.push(chained);
    });
  }

  if (!popped.size) return;
  state.balloons = state.balloons.filter(balloon => !popped.has(balloon.id));
  state.powerUps = state.powerUps.filter(
    powerUp => !soaked.some(point => samePoint(point, powerUp)),
  );
  cratesHit.forEach(point => {
    state.cells[cellIndex(point.x, point.y)] = CELL.FLOOR;
    const hidden = state.hiddenPowerUps.find(powerUp =>
      samePoint(powerUp, point),
    );
    if (!hidden) return;
    state.hiddenPowerUps = state.hiddenPowerUps.filter(
      powerUp => powerUp !== hidden,
    );
    state.powerUps.push(hidden);
  });
  soaked.forEach(point => {
    const existing = state.splashes.find(splash => samePoint(splash, point));
    if (existing) existing.ttl = SPLASH_TICKS;
    else state.splashes.push({ ...point, ttl: SPLASH_TICKS });
  });
};

const closeArena = (state: MatchState) => {
  const tile = closingTileAt(state.tick);
  if (!tile) return;
  state.cells[cellIndex(tile.x, tile.y)] = CELL.WALL;
  state.balloons = state.balloons.filter(balloon => !samePoint(balloon, tile));
  state.powerUps = state.powerUps.filter(powerUp => !samePoint(powerUp, tile));
  state.players
    .filter(player => samePoint(occupiedTile(player), tile))
    .forEach(player => {
      player.alive = false;
    });
};

const settleMatch = (state: MatchState) => {
  const alive = state.players.filter(player => player.alive);
  if (alive.length > 1) return;
  state.status = MATCH_STATUS.OVER;
  state.winnerId = alive[0]?.id ?? null;
};

export const advanceMatch = (
  previous: MatchState,
  inputs: Record<string, PlayerInput>,
): MatchState => {
  if (previous.status !== MATCH_STATUS.PLAYING) return previous;
  const state: MatchState = structuredClone(previous);
  state.tick++;

  state.splashes = state.splashes
    .map(splash => ({ ...splash, ttl: splash.ttl - 1 }))
    .filter(splash => splash.ttl > 0);

  state.players
    .filter(player => player.alive)
    .forEach(player => {
      const input = inputs[player.id] ?? NO_INPUT;
      if (input.placeBalloon) placeBalloon(state, player);
      movePlayer(state, player, input);
    });

  state.balloons.forEach(balloon => {
    balloon.fuse--;
  });
  popBalloons(state);

  state.players
    .filter(player => player.alive)
    .forEach(player => {
      const tile = occupiedTile(player);
      if (state.splashes.some(splash => samePoint(splash, tile))) {
        player.alive = false;
        return;
      }
      const powerUp = state.powerUps.find(item => samePoint(item, tile));
      if (!powerUp) return;
      applyPowerUp(player, powerUp);
      state.powerUps = state.powerUps.filter(item => item !== powerUp);
    });

  closeArena(state);
  settleMatch(state);
  return state;
};

export const eliminatePlayers = (state: MatchState, ids: string[]) => {
  if (!ids.length) return state;
  return {
    ...state,
    players: state.players.map(player =>
      ids.includes(player.id) ? { ...player, alive: false } : player,
    ),
  };
};
