import {
  cellAt,
  cellIndex,
  dangerMap,
  hypotheticalBalloon,
  isWalkable,
  neighbours,
  isCentered,
  occupiedTile,
  splashCells,
  ticksPerTile,
} from './board';
import {
  BALLOON_FUSE_TICKS,
  CELL,
  DIFFICULTY,
  NO_INPUT,
  SPLASH_TICKS,
} from './game.consts';
import {
  ArenaSize,
  Difficulty,
  Direction,
  MatchState,
  Player,
  PlayerInput,
  Point,
} from './game.types';

interface BotProfile {
  hesitationChance: number;
  maxHesitationTicks: number;
  wanderChance: number;
  dropChance: number;
  followsChains: boolean;
  safetyMarginTicks: number;
  huntsWhileCratesRemain: boolean;
  setsTraps: boolean;
  readsEnemies: boolean;
  seeksPowerUps: boolean;
}

export const BOT_PROFILES: Record<Difficulty, BotProfile> = {
  [DIFFICULTY.EASY]: {
    hesitationChance: 0.4,
    maxHesitationTicks: 14,
    wanderChance: 0.3,
    dropChance: 0.4,
    followsChains: false,
    safetyMarginTicks: 0,
    huntsWhileCratesRemain: false,
    setsTraps: false,
    readsEnemies: false,
    seeksPowerUps: false,
  },
  [DIFFICULTY.MEDIUM]: {
    hesitationChance: 0.15,
    maxHesitationTicks: 6,
    wanderChance: 0.08,
    dropChance: 0.85,
    followsChains: true,
    safetyMarginTicks: 2,
    huntsWhileCratesRemain: false,
    setsTraps: false,
    readsEnemies: false,
    seeksPowerUps: true,
  },
  [DIFFICULTY.HARD]: {
    hesitationChance: 0,
    maxHesitationTicks: 0,
    wanderChance: 0,
    dropChance: 1,
    followsChains: true,
    safetyMarginTicks: 4,
    huntsWhileCratesRemain: true,
    setsTraps: true,
    readsEnemies: true,
    seeksPowerUps: true,
  },
};

export type BotMemory = Map<string, { waitTicks: number }>;

interface PathResult {
  direction: Direction | null;
  distance: number;
}

const isSafeDuring = (
  state: ArenaSize,
  danger: number[],
  point: Point,
  arrival: number,
  stay: number,
) => {
  const soakAt = danger[cellIndex(state, point.x, point.y)];
  if (soakAt === Infinity) return true;
  return arrival + stay < soakAt || arrival > soakAt + SPLASH_TICKS + stay;
};

type Reachable = Point & PathResult;

// Breadth-first search over every tile the bot can reach without being on it
// while it is soaked, nearest first, each carrying the first step toward it.
const explore = (
  state: MatchState,
  bot: Player,
  danger: number[],
  marginTicks: number,
): Reachable[] => {
  const start = occupiedTile(bot);
  const tileTicks = ticksPerTile(bot);
  const visited = new Set<number>([cellIndex(state, start.x, start.y)]);
  const reached: Reachable[] = [{ ...start, direction: null, distance: 0 }];

  for (let cursor = 0; cursor < reached.length; cursor++) {
    const current = reached[cursor];
    neighbours(current).forEach(next => {
      const index = cellIndex(state, next.x, next.y);
      if (visited.has(index) || !isWalkable(state, next.x, next.y)) return;
      const arrival = (current.distance + 1) * tileTicks;
      if (
        !isSafeDuring(state, danger, next, arrival, tileTicks + marginTicks)
      ) {
        return;
      }
      visited.add(index);
      reached.push({
        ...next,
        direction: current.direction ?? next.direction,
        distance: current.distance + 1,
      });
    });
  }
  return reached;
};

const findPath = (
  state: MatchState,
  bot: Player,
  danger: number[],
  marginTicks: number,
  isGoal: (point: Point) => boolean,
): PathResult | null =>
  explore(state, bot, danger, marginTicks).find(isGoal) ?? null;

// A threat further off than a fresh balloon's whole fuse and splash is not
// worth reacting to yet. Without this horizon every tile would count as
// dangerous once sudden death schedules it, and bots would stop playing.
const CALM_HORIZON_TICKS = BALLOON_FUSE_TICKS + SPLASH_TICKS;

const isCalm = (state: ArenaSize, danger: number[]) => (point: Point) =>
  danger[cellIndex(state, point.x, point.y)] > CALM_HORIZON_TICKS;

const enemiesOf = (state: MatchState, bot: Player) =>
  state.players.filter(player => player.alive && player.id !== bot.id);

const hitsCrate = (state: MatchState, bot: Player, from: Point) =>
  splashCells(state, from, bot.range).some(
    point => cellAt(state, point.x, point.y) === CELL.CRATE,
  );

const hitsEnemy = (state: MatchState, bot: Player, from: Point) => {
  const splash = splashCells(state, from, bot.range);
  return enemiesOf(state, bot)
    .map(occupiedTile)
    .some(enemy =>
      splash.some(point => point.x === enemy.x && point.y === enemy.y),
    );
};

// A drop that leaves some enemy with no calm tile to run to, even if the
// enemy is not in the splash line yet.
const trapsEnemy = (state: MatchState, bot: Player, here: Point) => {
  const danger = dangerMap(state, [hypotheticalBalloon(bot, here)]);
  return enemiesOf(state, bot).some(
    enemy =>
      Math.abs(enemy.x - here.x) + Math.abs(enemy.y - here.y) <=
        bot.range + 1 &&
      !findPath(state, enemy, danger, 0, isCalm(state, danger)),
  );
};

const cratesRemain = (state: MatchState) => state.cells.includes(CELL.CRATE);

const ENEMY_NEARBY_DISTANCE = 2;
const ENEMY_NEARBY_PENALTY = 4;
const DEAD_END_PENALTY = 3;

// Shelter that is merely the closest calm tile is often a dead-end pocket an
// enemy can seal with one more balloon, so a bot that reads enemies weighs
// how cornered each candidate is against how far away it is.
const shelterCost = (
  state: MatchState,
  bot: Player,
  danger: number[],
  tile: Reachable,
) => {
  const enemiesNearby = enemiesOf(state, bot)
    .map(occupiedTile)
    .filter(
      enemy =>
        Math.abs(enemy.x - tile.x) + Math.abs(enemy.y - tile.y) <=
        ENEMY_NEARBY_DISTANCE,
    ).length;
  const exits = neighbours(tile).filter(
    next => isWalkable(state, next.x, next.y) && isCalm(state, danger)(next),
  ).length;
  return (
    tile.distance +
    enemiesNearby * ENEMY_NEARBY_PENALTY +
    (exits <= 1 ? DEAD_END_PENALTY : 0)
  );
};

const bestShelter = (
  state: MatchState,
  bot: Player,
  danger: number[],
  marginTicks: number,
  profile: BotProfile,
): PathResult | null => {
  const shelters = explore(state, bot, danger, marginTicks).filter(
    isCalm(state, danger),
  );
  if (!profile.readsEnemies) return shelters[0] ?? null;
  return (
    shelters
      .map(tile => ({ tile, cost: shelterCost(state, bot, danger, tile) }))
      .sort((a, b) => a.cost - b.cost)[0]?.tile ?? null
  );
};

const escapeRoute = (
  state: MatchState,
  bot: Player,
  danger: number[],
  profile: BotProfile,
) =>
  bestShelter(state, bot, danger, profile.safetyMarginTicks, profile) ??
  bestShelter(state, bot, danger, 0, profile);

const walk = (path: PathResult | null): PlayerInput =>
  path?.direction
    ? { direction: path.direction, placeBalloon: false }
    : NO_INPUT;

const canEscapeAfterDrop = (
  state: MatchState,
  bot: Player,
  spot: Point,
  profile: BotProfile,
) => {
  const standing = {
    ...bot,
    x: spot.x,
    y: spot.y,
  };
  const danger = dangerMap(
    state,
    [hypotheticalBalloon(bot, spot)],
    profile.followsChains,
  );
  return Boolean(escapeRoute(state, standing, danger, profile));
};

const wantsToDrop = (
  state: MatchState,
  bot: Player,
  here: Point,
  profile: BotProfile,
) => {
  const owned = state.balloons.filter(
    balloon => balloon.ownerId === bot.id,
  ).length;
  if (owned >= bot.maxBalloons) return false;
  const worthIt =
    hitsCrate(state, bot, here) ||
    hitsEnemy(state, bot, here) ||
    (profile.setsTraps && trapsEnemy(state, bot, here));
  if (!worthIt) return false;
  if (Math.random() > profile.dropChance) return false;
  return canEscapeAfterDrop(state, bot, here, profile);
};

const chooseTarget = (
  state: MatchState,
  bot: Player,
  danger: number[],
  profile: BotProfile,
) => {
  const margin = profile.safetyMarginTicks;
  const calm = isCalm(state, danger);
  const toPowerUp = () =>
    findPath(
      state,
      bot,
      danger,
      margin,
      point =>
        calm(point) &&
        state.powerUps.some(item => item.x === point.x && item.y === point.y),
    );
  const toCrate = () =>
    findPath(
      state,
      bot,
      danger,
      margin,
      point =>
        calm(point) &&
        hitsCrate(state, bot, point) &&
        canEscapeAfterDrop(state, bot, point, profile),
    );
  const enemies = enemiesOf(state, bot).map(occupiedTile);
  const toEnemy = () =>
    findPath(
      state,
      bot,
      danger,
      margin,
      point =>
        calm(point) &&
        hitsEnemy(state, bot, point) &&
        canEscapeAfterDrop(state, bot, point, profile),
    ) ??
    findPath(
      state,
      bot,
      danger,
      margin,
      point =>
        calm(point) &&
        enemies.some(
          enemy =>
            Math.abs(enemy.x - point.x) + Math.abs(enemy.y - point.y) <= 1,
        ),
    );

  const hunt = profile.huntsWhileCratesRemain || !cratesRemain(state);
  const strategies = [
    ...(profile.seeksPowerUps ? [toPowerUp] : []),
    ...(hunt ? [toEnemy, toCrate] : [toCrate, toEnemy]),
  ];
  for (const strategy of strategies) {
    const path = strategy();
    if (path) return path;
  }
  return null;
};

const wander = (state: MatchState, bot: Player, danger: number[]) => {
  const options = neighbours(occupiedTile(bot)).filter(
    next => isWalkable(state, next.x, next.y) && isCalm(state, danger)(next),
  );
  if (!options.length) return NO_INPUT;
  const pick = options[Math.floor(Math.random() * options.length)];
  return { direction: pick.direction, placeBalloon: false };
};

// No calm tile is reachable (a tight trap, or the last seconds of sudden
// death): head for the reachable tile that stays dry the longest.
const latestSoakedTile = (
  state: MatchState,
  bot: Player,
  danger: number[],
): PathResult | null =>
  explore(state, bot, danger, 0).reduce<Reachable | null>(
    (best, tile) =>
      !best ||
      danger[cellIndex(state, tile.x, tile.y)] >
        danger[cellIndex(state, best.x, best.y)]
        ? tile
        : best,
    null,
  );

// Easier bots pause now and then while calm, which is most of what makes
// them beatable; it never delays an escape.
const isHesitating = (bot: Player, profile: BotProfile, memory: BotMemory) => {
  const notes = memory.get(bot.id) ?? { waitTicks: 0 };
  memory.set(bot.id, notes);
  if (notes.waitTicks > 0) {
    notes.waitTicks--;
    return true;
  }
  if (Math.random() >= profile.hesitationChance) return false;
  notes.waitTicks = Math.ceil(Math.random() * profile.maxHesitationTicks);
  return true;
};

const decideTileInput = (
  state: MatchState,
  bot: Player,
  memory: BotMemory,
): PlayerInput => {
  if (!bot.alive || !bot.difficulty) return NO_INPUT;
  const profile = BOT_PROFILES[bot.difficulty];
  const here = occupiedTile(bot);
  const danger = dangerMap(state, [], profile.followsChains);

  if (!isCalm(state, danger)(here)) {
    const escape = escapeRoute(state, bot, danger, profile);
    return walk(escape ?? latestSoakedTile(state, bot, danger));
  }
  if (isHesitating(bot, profile, memory)) return NO_INPUT;
  if (wantsToDrop(state, bot, here, profile)) {
    return { direction: null, placeBalloon: true };
  }
  if (Math.random() < profile.wanderChance) return wander(state, bot, danger);
  return walk(chooseTarget(state, bot, danger, profile));
};

export const decideCpuInput = (
  state: MatchState,
  bot: Player,
  memory: BotMemory,
): PlayerInput => {
  if (!isCentered(bot)) {
    return { direction: bot.facing, placeBalloon: false, snap: true };
  }
  return { ...decideTileInput(state, bot, memory), snap: true };
};
