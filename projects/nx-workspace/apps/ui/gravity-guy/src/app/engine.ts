export const WORLD = {
  height: 480,
  ceiling: 78,
  floor: 402,
  playerX: 126,
  playerSize: 28,
  step: 1 / 120,
  startSpeed: 440,
  maxSpeed: 720,
} as const;

export type Status = 'ready' | 'running' | 'paused' | 'over';
export type Player = {
  distance: number;
  y: number;
  velocity: number;
  gravity: 1 | -1;
  blocked: boolean;
  speedMultiplier: number;
  surfaceEffect: 'boost' | 'slow' | null;
  out: boolean;
};
export type Run = Player & {
  camera: number;
  viewWidth: number;
  mapSpeedMultiplier: number;
  seed: number;
  partner?: Player;
  winner: 1 | 2 | 'tie' | null;
  dog: {
    x: number;
    y: number;
    velocity: number;
    gravity: 1 | -1;
    respawnTimer: number;
    speedMultiplier: number;
    blockedFor: number;
    decisionIn: number;
    barkIn?: number;
    barkTime?: number;
  };
  status: Status;
};
export type Platform = {
  x: number;
  y: number;
  width: number;
  height: number;
  obstacle?: boolean;
  effect?: 'boost' | 'slow';
};

const DEFAULT_VIEW_WIDTH = 680;
const centerOffset = (run: Run) =>
  (run.viewWidth - WORLD.playerSize) / 2 - WORLD.playerX;
const DOG_WIDTH = 80;
const DOG_HEIGHT = 49;
const DOG_BARK_DURATION = 0.55;
const PLATFORM_HEIGHT = 18;
const GRAVITY_ACCELERATION = 2400;
const FLIP_SPEED = 220;
const CHUNK_LENGTH = 1600;
const SAFE_DISTANCE = 6400;
const randomSource = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};
const createPlayer = (distance = 0): Player => ({
  distance,
  y: WORLD.floor - WORLD.playerSize,
  velocity: 0,
  gravity: 1,
  blocked: false,
  speedMultiplier: 1,
  surfaceEffect: null,
  out: false,
});
export const createRun = (
  seed = Math.floor(Math.random() * 0x100000000),
  playerCount: 1 | 2 = 1,
): Run => ({
  ...createPlayer(),
  camera: WORLD.playerX - (DEFAULT_VIEW_WIDTH - WORLD.playerSize) / 2,
  viewWidth: DEFAULT_VIEW_WIDTH,
  mapSpeedMultiplier: 1,
  seed,
  partner: playerCount === 2 ? createPlayer() : undefined,
  winner: null,
  dog: {
    x: WORLD.playerX - (DEFAULT_VIEW_WIDTH - WORLD.playerSize) / 2 + 8,
    y: WORLD.floor - DOG_HEIGHT,
    velocity: 0,
    gravity: 1,
    respawnTimer: 0,
    speedMultiplier: 1,
    blockedFor: 0,
    decisionIn: 0,
    barkIn: 2.5 + (seed % 30) / 10,
    barkTime: 0,
  },
  status: 'ready',
});
const baseSpeedOf = (run: Run) =>
  Math.min(
    WORLD.maxSpeed,
    WORLD.startSpeed + (run.camera + centerOffset(run)) / 90,
  );
export const speedOf = (run: Run) =>
  baseSpeedOf(run) * (run.mapSpeedMultiplier ?? 1);
export const scoreOf = (run: Player) =>
  Math.max(0, Math.floor(run.distance / 10));
const narrowPlatforms = (start: number, variant: number): Platform[] => {
  const profiles = [
    [282, 252, 222, 192, 162],
    [162, 192, 222, 252, 282],
    [252, 192, 252, 192, 252],
  ];
  const platforms: Platform[] = [];
  for (const x of [start, start + 1400]) {
    platforms.push({
      x,
      y: WORLD.ceiling - PLATFORM_HEIGHT,
      width: 200,
      height: PLATFORM_HEIGHT,
    });
    platforms.push({ x, y: WORLD.floor, width: 200, height: PLATFORM_HEIGHT });
  }
  for (const [step, center] of profiles[variant].entries()) {
    const x = start + 200 + step * 240;
    const top = center - 74;
    const bottom = center + 74;
    platforms.push({
      x,
      y: WORLD.ceiling - PLATFORM_HEIGHT,
      width: 240,
      height: top - WORLD.ceiling + PLATFORM_HEIGHT,
      obstacle: true,
    });
    platforms.push({
      x,
      y: bottom,
      width: 240,
      height: WORLD.floor + PLATFORM_HEIGHT - bottom,
      obstacle: true,
    });
    const onFloor = step % 2 === (variant === 1 ? 0 : 1);
    platforms.push({
      x: x + 150,
      y: onFloor ? bottom - 36 : top,
      width: 44,
      height: 36,
      obstacle: true,
    });
  }
  return platforms;
};
type RailPatch = {
  x: number;
  width: number;
  effect?: 'slow' | 'boost';
  gap?: boolean;
};
const areaRail = (
  start: number,
  y: number,
  patches: RailPatch[],
): Platform[] => {
  const edges = [
    ...new Set([
      0,
      CHUNK_LENGTH,
      ...patches.flatMap(patch => [patch.x, patch.x + patch.width]),
    ]),
  ].sort((a, b) => a - b);
  return edges.slice(0, -1).flatMap((left, index) => {
    const right = edges[index + 1];
    const patch = patches.find(
      patch =>
        (left + right) / 2 >= patch.x &&
        (left + right) / 2 < patch.x + patch.width,
    );
    return patch?.gap
      ? []
      : [
          {
            x: start + left,
            y,
            width: right - left,
            height: PLATFORM_HEIGHT,
            effect: patch?.effect,
          },
        ];
  });
};
const slowGauntletPlatforms = (start: number, mirror: boolean): Platform[] => {
  const patches = [0, 1, 2].map(step => ({
    x: 200 + step * 420,
    width: 360,
    effect: 'slow' as const,
  }));
  return [1, -1].flatMap(side =>
    areaRail(
      start,
      side === 1 ? WORLD.floor : WORLD.ceiling - PLATFORM_HEIGHT,
      patches.filter(
        (_, step) => (step % 2 === 0 ? 1 : -1) * (mirror ? -1 : 1) === side,
      ),
    ),
  );
};
const boostRunoutPlatforms = (start: number, mirror: boolean): Platform[] => {
  const first: RailPatch[] = [
    { x: 160, width: 580, effect: 'boost' },
    { x: 820, width: 260, gap: true },
  ];
  const second: RailPatch[] = [
    { x: 900, width: 380, effect: 'boost' },
    { x: 1360, width: 180, gap: true },
  ];
  return [
    ...areaRail(start, WORLD.floor, mirror ? second : first),
    ...areaRail(
      start,
      WORLD.ceiling - PLATFORM_HEIGHT,
      mirror ? first : second,
    ),
  ];
};
const shortZigzagPlatforms = (start: number): Platform[] => [
  {
    x: start,
    y: WORLD.ceiling - PLATFORM_HEIGHT,
    width: 260,
    height: 116,
    obstacle: true,
  },
  { x: start, y: 326, width: 260, height: 94, obstacle: true },
  ...[306, 150, 286, 170, 306].map((y, step) => ({
    x: start + 260 + step * 230,
    y,
    width: 190,
    height: PLATFORM_HEIGHT,
  })),
  {
    x: start + 1420,
    y: WORLD.ceiling - PLATFORM_HEIGHT,
    width: 180,
    height: PLATFORM_HEIGHT,
  },
  { x: start + 1420, y: WORLD.floor, width: 180, height: PLATFORM_HEIGHT },
];
const chunkPlan = (seed: number, index: number) => {
  const start = index * CHUNK_LENGTH;
  const random = randomSource(seed ^ Math.imul(index + 1, 0x45d9f3b));
  const sectionRandom = randomSource(seed ^ Math.imul(index + 1, 0x119de1f3));
  const areaChoice = sectionRandom();
  if (index >= 4 && areaChoice < 0.2)
    return {
      obstacles: narrowPlatforms(start, Math.floor(sectionRandom() * 3)),
      custom: true,
      pressure: 5,
      side: 1,
      gap: null,
    };
  if (index >= 4 && areaChoice < 0.38)
    return {
      obstacles: slowGauntletPlatforms(start, sectionRandom() < 0.5),
      custom: true,
      pressure: 3,
      side: 1,
      gap: null,
    };
  if (index >= 6 && areaChoice < 0.52)
    return {
      obstacles: boostRunoutPlatforms(start, sectionRandom() < 0.5),
      custom: true,
      pressure: 2,
      side: 1,
      gap: null,
    };
  if (index >= 8 && areaChoice < 0.66)
    return {
      obstacles: shortZigzagPlatforms(start),
      custom: true,
      pressure: 5,
      side: 1,
      gap: null,
    };
  const side = index === 0 || random() < 0.5 ? 1 : -1;
  const hasGap = start >= SAFE_DISTANCE && random() < 0.22;
  const gapX = start + 650 + Math.floor(random() * 160);
  const gapWidth = 120 + Math.floor(random() * (index >= 8 ? 180 : 60));
  if (hasGap)
    return {
      obstacles: [] as Platform[],
      custom: false,
      pressure: 0,
      side,
      gap: { x: gapX, width: gapWidth },
    };
  const x = start + (index === 0 ? 1000 : 550) + Math.floor(random() * 140);
  const shape = index === 0 ? 0 : Math.floor(random() * 4);
  const count = shape === 0 ? 1 : 3 + Math.floor(random() * 2);
  const stepWidth = 65 + Math.floor(random() * 45);
  const baseHeight = 60 + Math.floor(random() * 25);
  const obstacles: Platform[] = [];
  for (let step = 0; step < count; step++) {
    const rise = shape === 1 ? step : shape === 2 ? count - 1 - step : step % 2;
    const height = baseHeight + rise * (18 + Math.floor(random() * 9));
    obstacles.push({
      x: x + step * stepWidth,
      y: side === 1 ? WORLD.floor - height : WORLD.ceiling,
      width: count > 1 ? stepWidth : 110 + Math.floor(random() * 90),
      height,
      obstacle: true,
    });
  }
  return {
    obstacles,
    custom: false,
    pressure: obstacles.length,
    side,
    gap: null,
  };
};
export const platformsNear = (
  run: Run,
  distance: number,
  width: number,
): Platform[] => {
  const platforms: Platform[] = [];
  const first = Math.max(0, Math.floor(distance / CHUNK_LENGTH));
  const last = Math.max(0, Math.floor((distance + width) / CHUNK_LENGTH));
  for (let index = first; index <= last; index++) {
    const start = index * CHUNK_LENGTH;
    const plan = chunkPlan(run.seed, index);
    if (plan.custom) {
      platforms.push(...plan.obstacles);
      continue;
    }
    const random = randomSource(run.seed ^ Math.imul(index + 1, 0x27d4eb2d));
    const obstacleEnd = Math.max(
      0,
      ...plan.obstacles.map(platform => platform.x + platform.width),
    );
    const recentObstacles =
      index < 2
        ? 0
        : [index - 2, index - 1, index].reduce((total, previous) => {
            const section =
              previous === index ? plan : chunkPlan(run.seed, previous);
            return total + section.pressure;
          }, 0);
    const boost = recentObstacles >= 6 && random() < 0.65;
    const slow =
      !boost && index > 0 && plan.obstacles.length > 0 && random() < 0.55;
    const effectSide = boost
      ? plan.gap
        ? plan.side
        : -plan.side
      : random() < 0.5
        ? plan.side
        : -plan.side;
    for (const railSide of [1, -1]) {
      const y = railSide === 1 ? WORLD.floor : WORLD.ceiling - PLATFORM_HEIGHT;
      const effect =
        slow && railSide === effectSide
          ? 'slow'
          : boost && railSide === effectSide
            ? 'boost'
            : undefined;
      const effectX =
        effect === 'slow'
          ? obstacleEnd + 60
          : plan.gap
            ? plan.gap.x - 300
            : obstacleEnd + 110;
      const effectWidth = effect === 'slow' ? 200 : 220;
      const addRail = (x: number, width: number) => {
        const end = x + width;
        if (effect && effectX >= x && effectX + effectWidth <= end) {
          platforms.push({ x, y, width: effectX - x, height: PLATFORM_HEIGHT });
          platforms.push({
            x: effectX,
            y,
            width: effectWidth,
            height: PLATFORM_HEIGHT,
            effect,
          });
          platforms.push({
            x: effectX + effectWidth,
            y,
            width: end - effectX - effectWidth,
            height: PLATFORM_HEIGHT,
          });
        } else platforms.push({ x, y, width, height: PLATFORM_HEIGHT });
      };
      if (plan.gap && railSide === plan.side) {
        addRail(start, plan.gap.x - start);
        addRail(
          plan.gap.x + plan.gap.width,
          start + CHUNK_LENGTH - plan.gap.x - plan.gap.width,
        );
      } else {
        const railStart = index === 0 ? Math.min(0, distance) : start;
        addRail(railStart, start + CHUNK_LENGTH - railStart);
      }
    }
    platforms.push(...plan.obstacles);
  }
  return platforms;
};
const overlapsPlayer = (run: Player, platform: Platform) => {
  const x = run.distance + WORLD.playerX;
  return x + WORLD.playerSize > platform.x && x < platform.x + platform.width;
};
const supportingPlatform = (run: Run, player: Player = run) =>
  player.velocity === 0
    ? platformsNear(
        run,
        player.distance,
        WORLD.playerX + WORLD.playerSize,
      ).find(
        platform =>
          overlapsPlayer(player, platform) &&
          (player.gravity === 1
            ? player.y + WORLD.playerSize === platform.y
            : player.y === platform.y + platform.height),
      )
    : undefined;
export const touchingPlatform = (run: Run, playerNumber: 1 | 2 = 1) => {
  const player = playerNumber === 1 ? run : run.partner;
  return Boolean(player && !player.out && supportingPlatform(run, player));
};
export const flip = (run: Run, playerNumber: 1 | 2 = 1) => {
  const player = playerNumber === 1 ? run : run.partner;
  if (
    run.status !== 'running' ||
    !player ||
    !touchingPlatform(run, playerNumber)
  )
    return false;
  player.gravity = player.gravity === 1 ? -1 : 1;
  player.velocity = player.gravity * FLIP_SPEED;
  return true;
};
const advancePlayer = (run: Run, player: Player, movement: number) => {
  const effect = supportingPlatform(run, player)?.effect;
  player.surfaceEffect = effect ?? null;
  const targetSpeed = effect === 'boost' ? 1.3 : effect === 'slow' ? 0.65 : 1;
  player.speedMultiplier +=
    (targetSpeed - player.speedMultiplier) * (1 - Math.exp(-6 * WORLD.step));
  const previousRight = player.distance + WORLD.playerX + WORLD.playerSize;
  const targetOffset = centerOffset(run);
  const lag = Math.max(0, run.camera + targetOffset - player.distance);
  const recovery =
    lag < 0.1
      ? lag
      : Math.min(lag * (1 - Math.exp(-2.4 * WORLD.step)), movement * 0.4);
  const runnerMovement =
    movement * player.speedMultiplier +
    (player.speedMultiplier >= 0.98 ? recovery : 0);
  let nextDistance = Math.min(
    player.distance + runnerMovement,
    run.camera + movement + targetOffset,
  );
  const platforms = platformsNear(
    run,
    player.distance,
    WORLD.playerX + WORLD.playerSize + runnerMovement,
  );
  player.blocked = false;
  for (const platform of platforms) {
    if (
      previousRight <= platform.x + 0.000001 &&
      nextDistance + WORLD.playerX + WORLD.playerSize > platform.x &&
      player.y + WORLD.playerSize > platform.y &&
      player.y < platform.y + platform.height
    ) {
      nextDistance = platform.x - WORLD.playerX - WORLD.playerSize;
      player.blocked = true;
    }
  }
  player.distance = nextDistance;
  const previousY = player.y;
  player.velocity += player.gravity * GRAVITY_ACCELERATION * WORLD.step;
  player.y += player.velocity * WORLD.step;
  for (const platform of platforms) {
    if (!overlapsPlayer(player, platform)) continue;
    if (
      player.velocity >= 0 &&
      previousY + WORLD.playerSize <= platform.y &&
      player.y + WORLD.playerSize >= platform.y
    ) {
      player.y = platform.y - WORLD.playerSize;
      player.velocity = 0;
    } else if (
      player.velocity <= 0 &&
      previousY >= platform.y + platform.height &&
      player.y <= platform.y + platform.height
    ) {
      player.y = platform.y + platform.height;
      player.velocity = 0;
    }
  }
};
export const advance = (run: Run) => {
  if (run.status !== 'running') return;
  const players = run.partner ? [run, run.partner] : [run];
  const boostActive = players.some(
    player => supportingPlatform(run, player)?.effect === 'boost',
  );
  const multiplier = run.mapSpeedMultiplier ?? 1;
  run.mapSpeedMultiplier =
    multiplier +
    ((boostActive ? 1.3 : 1) - multiplier) * (1 - Math.exp(-4 * WORLD.step));
  const movement = speedOf(run) * WORLD.step;
  for (const player of players) advancePlayer(run, player, movement);
  run.camera += movement;
  advanceDog(run, movement);
  for (const player of players) {
    const x = player.distance + WORLD.playerX;
    const caught =
      run.dog.respawnTimer === 0 &&
      x < run.dog.x + DOG_WIDTH &&
      x + WORLD.playerSize > run.dog.x &&
      player.y + WORLD.playerSize > run.dog.y &&
      player.y < run.dog.y + DOG_HEIGHT;
    player.out =
      caught ||
      x <= run.camera ||
      player.y > WORLD.height ||
      player.y + WORLD.playerSize < 0;
  }
  if (players.some(player => player.out)) {
    run.status = 'over';
    if (run.partner)
      run.winner = run.out && run.partner.out ? 'tie' : run.out ? 2 : 1;
  }
};

type DogBody = Pick<
  Run['dog'],
  'x' | 'y' | 'velocity' | 'gravity' | 'speedMultiplier'
>;
const moveDogBody = (
  dog: DogBody,
  platforms: Platform[],
  step: number,
  movement: number,
) => {
  const previousRight = dog.x + DOG_WIDTH;
  let nextX = dog.x + movement;
  for (const platform of platforms) {
    if (
      previousRight <= platform.x + 0.000001 &&
      nextX + DOG_WIDTH > platform.x &&
      dog.y + DOG_HEIGHT > platform.y &&
      dog.y < platform.y + platform.height
    )
      nextX = platform.x - DOG_WIDTH;
  }
  dog.x = nextX;
  const previousY = dog.y;
  dog.velocity += dog.gravity * GRAVITY_ACCELERATION * step;
  dog.y += dog.velocity * step;
  for (const platform of platforms) {
    if (!(
      dog.x + DOG_WIDTH > platform.x && dog.x < platform.x + platform.width
    ))
      continue;
    if (
      dog.velocity >= 0 &&
      previousY + DOG_HEIGHT <= platform.y &&
      dog.y + DOG_HEIGHT >= platform.y
    ) {
      dog.y = platform.y - DOG_HEIGHT;
      dog.velocity = 0;
    } else if (
      dog.velocity <= 0 &&
      previousY >= platform.y + platform.height &&
      dog.y <= platform.y + platform.height
    ) {
      dog.y = platform.y + platform.height;
      dog.velocity = 0;
    }
  }
};
const dogTargetGap = (dog: DogBody, target: Player) => {
  const x = target.distance + WORLD.playerX;
  return Math.hypot(
    Math.max(0, x - dog.x - DOG_WIDTH, dog.x - x - WORLD.playerSize),
    Math.max(
      0,
      target.y - dog.y - DOG_HEIGHT,
      dog.y - target.y - WORLD.playerSize,
    ),
  );
};
const dogPursuit = (run: Run) =>
  (run.mapSpeedMultiplier ?? 1) > 1.01 ? 1 : 1.08;
const bestDogFlip = (run: Run, target: Player, hunting: boolean) => {
  const platforms = platformsNear(run, run.dog.x, 1300);
  const step = 1 / 30;
  const pace = baseSpeedOf(run);
  let routes = [
    { body: { ...run.dog } as DogBody, firstFlip: false, cost: 0, score: 0 },
  ];
  for (let frame = 0; frame < 30; frame++) {
    const next: typeof routes = [];
    for (const route of routes) {
      const body = route.body;
      const support =
        body.velocity === 0
          ? platforms.find(
              platform =>
                body.x + DOG_WIDTH > platform.x &&
                body.x < platform.x + platform.width &&
                (body.gravity === 1
                  ? body.y + DOG_HEIGHT === platform.y
                  : body.y === platform.y + platform.height),
            )
          : undefined;
      for (const flipNow of support ? [false, true] : [false]) {
        const candidate = { ...body };
        if (flipNow) {
          candidate.gravity = candidate.gravity === 1 ? -1 : 1;
          candidate.velocity = candidate.gravity * FLIP_SPEED;
        }
        const effect = flipNow ? undefined : support?.effect;
        const speed = effect === 'boost' ? 1.3 : effect === 'slow' ? 0.65 : 1;
        candidate.speedMultiplier +=
          (speed - candidate.speedMultiplier) * (1 - Math.exp(-6 * step));
        moveDogBody(
          candidate,
          platforms,
          step,
          pace * candidate.speedMultiplier * dogPursuit(run) * step,
        );
        const predictedTarget = {
          ...target,
          distance:
            target.distance +
            (target.blocked
              ? 0
              : pace * target.speedMultiplier * (frame + 1) * step),
        };
        // A catch ends the chase before the landing beyond it matters.
        if (hunting && dogTargetGap(candidate, predictedTarget) === 0)
          return frame === 0 ? flipNow : route.firstFlip;
        if (candidate.y > WORLD.height || candidate.y + DOG_HEIGHT < 0)
          continue;
        const cost =
          route.cost +
          (effect === 'slow'
            ? 50 * step
            : effect === 'boost'
              ? -45 * step
              : 0) +
          (flipNow ? 0.3 : 0);
        next.push({
          body: candidate,
          firstFlip: frame === 0 ? flipNow : route.firstFlip,
          cost,
          score: hunting
            ? (candidate.x - run.dog.x) * 0.15 -
              dogTargetGap(candidate, predictedTarget) * 2 -
              cost * 0.15
            : candidate.x -
              run.dog.x -
              cost -
              Math.abs(candidate.y - target.y) * 0.04,
        });
      }
    }
    if (!next.length) break;
    const seen = new Set<string>();
    routes = next
      .sort((a, b) => b.score - a.score)
      .filter(route => {
        const key = [
          route.firstFlip,
          Math.round(route.body.x / 16),
          Math.round(route.body.y / 16),
          route.body.gravity,
          Math.round(route.body.velocity / 120),
        ].join(',');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 10);
  }
  return routes[0]?.firstFlip ?? false;
};

const advanceDog = (run: Run, movement: number) => {
  const dog = run.dog;
  const target =
    run.partner && dogTargetGap(dog, run.partner) < dogTargetGap(dog, run)
      ? run.partner
      : run;
  const hunting =
    Math.abs(target.distance + WORLD.playerX - dog.x - DOG_WIDTH) < 220;
  if (dog.respawnTimer > 0) {
    dog.respawnTimer = Math.max(0, dog.respawnTimer - WORLD.step);
    if (dog.respawnTimer === 0) respawnDog(run);
    return;
  }
  if (
    dog.y > WORLD.height + DOG_HEIGHT ||
    dog.y + DOG_HEIGHT < -DOG_HEIGHT ||
    ((dog.blockedFor ?? 0) > 3 && dog.x + DOG_WIDTH < run.camera - 160)
  ) {
    dog.respawnTimer = 2.5;
    return;
  }
  dog.barkTime = Math.max(0, (dog.barkTime ?? 0) - WORLD.step);
  dog.barkIn = (dog.barkIn ?? 3) - WORLD.step;
  if (dog.barkIn <= 0) {
    dog.barkTime = DOG_BARK_DURATION;
    dog.barkIn = 3.5 + randomSource(run.seed ^ Math.floor(run.camera))() * 3;
  }
  const lookAhead = Math.max(120, speedOf(run) * 0.28);
  const platforms = platformsNear(
    run,
    dog.x,
    DOG_WIDTH + lookAhead + movement * 1.35,
  );
  const overlapping = (platform: Platform) =>
    dog.x + DOG_WIDTH > platform.x && dog.x < platform.x + platform.width;
  const support =
    dog.velocity === 0
      ? platforms.find(
          platform =>
            overlapping(platform) &&
            (dog.gravity === 1
              ? dog.y + DOG_HEIGHT === platform.y
              : dog.y === platform.y + platform.height),
        )
      : undefined;
  const effectSpeed =
    support?.effect === 'boost' ? 1.3 : support?.effect === 'slow' ? 0.65 : 1;
  const dogSpeed = dog.speedMultiplier ?? 1;
  dog.speedMultiplier =
    dogSpeed + (effectSpeed - dogSpeed) * (1 - Math.exp(-6 * WORLD.step));
  dog.decisionIn = Math.max(0, (dog.decisionIn ?? 0) - WORLD.step);
  if (support && dog.decisionIn === 0) {
    dog.decisionIn = 0.1;
    if (bestDogFlip(run, target, hunting)) {
      dog.gravity = dog.gravity === 1 ? -1 : 1;
      dog.velocity = dog.gravity * FLIP_SPEED;
    }
  }
  const pursuit = dogPursuit(run);
  const dogMovement =
    baseSpeedOf(run) * WORLD.step * dog.speedMultiplier * pursuit;
  const previousX = dog.x;
  moveDogBody(
    dog,
    platforms,
    WORLD.step,
    Math.min(
      Math.max(
        0,
        (hunting
          ? Math.max(
              run.camera + 8,
              target.distance + WORLD.playerX - DOG_WIDTH + 8,
            )
          : run.camera + 8) - dog.x,
      ),
      dogMovement,
    ),
  );
  dog.blockedFor =
    dog.x <= previousX + 0.000001 ? (dog.blockedFor ?? 0) + WORLD.step : 0;
};

const respawnDog = (run: Run) => {
  const furthest = Math.min(
    run.camera + 20,
    Math.min(run.distance, run.partner?.distance ?? run.distance) +
      WORLD.playerX -
      DOG_WIDTH -
      100,
  );
  const firstX = Math.min(run.camera - 120, furthest - 40);
  const platforms = platformsNear(
    run,
    firstX - 80,
    furthest - firstX + DOG_WIDTH + 160,
  );
  for (let x = firstX; x <= furthest; x += 20) {
    for (const gravity of [run.gravity, -run.gravity] as const) {
      for (const platform of platforms) {
        if (x < platform.x || x + DOG_WIDTH > platform.x + platform.width)
          continue;
        const y =
          gravity === 1
            ? platform.y - DOG_HEIGHT
            : platform.y + platform.height;
        if (y < WORLD.ceiling || y + DOG_HEIGHT > WORLD.floor) continue;
        const blocked = platforms.some(
          other =>
            x + DOG_WIDTH > other.x &&
            x < other.x + other.width &&
            y + DOG_HEIGHT > other.y &&
            y < other.y + other.height,
        );
        if (blocked) continue;
        run.dog = {
          x,
          y,
          velocity: 0,
          gravity: gravity as 1 | -1,
          respawnTimer: 0,
          speedMultiplier: 1,
          blockedFor: 0,
          decisionIn: 0,
        };
        return;
      }
    }
  }
  run.dog.respawnTimer = 0.3;
};

const paintShiba = (context: CanvasRenderingContext2D, run: Run) => {
  if (run.dog.respawnTimer > 0) return;
  const stride =
    run.status === 'running' && run.dog.velocity === 0
      ? Math.sin(run.dog.x / 15) * 4
      : 0;
  context.save();
  context.translate(
    run.dog.x - run.camera + 37,
    run.dog.y + (run.dog.gravity === 1 ? 32 : 17),
  );
  context.scale(1, run.dog.gravity);
  if (run.status === 'running') {
    const plume = 14 + (Math.sin(run.dog.x * 0.23) + 1) * 5;
    context.fillStyle = '#28b9ff';
    context.beginPath();
    context.moveTo(-23, -25);
    context.lineTo(-28 - plume, -21);
    context.lineTo(-23, -16);
    context.closePath();
    context.fill();
    context.fillStyle = '#c5f6ff';
    context.beginPath();
    context.moveTo(-23, -23);
    context.lineTo(-29 - plume * 0.55, -21);
    context.lineTo(-23, -19);
    context.closePath();
    context.fill();
  }
  context.fillStyle = '#60758d';
  context.strokeStyle = '#142437';
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(-25, -30, 29, 20, 5);
  context.fill();
  context.stroke();
  context.fillStyle = '#b9cddd';
  context.fillRect(-28, -26, 7, 11);
  context.fillStyle = '#60ead7';
  context.fillRect(-15, -26, 12, 3);
  context.strokeStyle = '#142437';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(-4, -12);
  context.lineTo(0, 10);
  context.stroke();
  context.strokeStyle = '#080d16';
  context.lineWidth = 2;
  context.fillStyle = '#202937';
  context.beginPath();
  context.ellipse(-5, 0, 24, 12, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.strokeStyle = '#303c4e';
  context.lineWidth = 8;
  context.beginPath();
  context.arc(-29, -9, 9, 0.4, Math.PI * 2.1);
  context.stroke();
  context.strokeStyle = '#f1e4cf';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(-29, -9, 5, 0.6, Math.PI * 1.6);
  context.stroke();
  context.fillStyle = '#f1e4cf';
  context.beginPath();
  context.ellipse(-1, 5, 18, 6, 0, 0, Math.PI * 2);
  context.fill();
  for (const [x, swing] of [
    [-20, stride],
    [9, -stride],
  ]) {
    context.fillStyle = '#202937';
    context.fillRect(x + swing, 6, 7, 10);
    context.fillStyle = '#f1e4cf';
    context.fillRect(x + swing, 13, 8, 4);
  }
  context.fillStyle = '#202937';
  context.strokeStyle = '#080d16';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(9, -14);
  context.lineTo(12, -32);
  context.lineTo(24, -22);
  context.lineTo(34, -31);
  context.lineTo(39, -11);
  context.closePath();
  context.fill();
  context.stroke();
  context.beginPath();
  context.ellipse(24, -9, 17, 15, 0, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = '#f1e4cf';
  context.beginPath();
  context.ellipse(30, -2, 13, 8, -0.2, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#302a29';
  context.beginPath();
  context.arc(29, -13, 2.3, 0, Math.PI * 2);
  context.arc(41, -5, 3, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#f1e4cf';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(23, -19);
  context.lineTo(29, -20);
  context.stroke();
  const barkTime = run.dog.barkTime ?? 0;
  if (barkTime > 0) {
    const pulse = Math.sin(
      ((DOG_BARK_DURATION - barkTime) * Math.PI) / DOG_BARK_DURATION,
    );
    context.fillStyle = '#080d16';
    context.beginPath();
    context.ellipse(38, 2, 5, 2 + pulse * 4, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#60ead7';
    context.lineWidth = 2;
    for (const radius of [9, 16]) {
      context.beginPath();
      context.arc(43, -3, radius + pulse * 3, -0.6, 0.6);
      context.stroke();
    }
    context.save();
    context.translate(24, -45);
    context.scale(1, run.dog.gravity);
    context.font = 'bold 12px Arial';
    context.textAlign = 'center';
    context.fillStyle = '#142437';
    context.strokeStyle = '#f1e4cf';
    context.lineWidth = 3;
    context.strokeText('WOOF!', 0, 0);
    context.fillText('WOOF!', 0, 0);
    context.restore();
  }
  context.strokeStyle = '#e0574d';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(12, -1);
  context.lineTo(17, 7);
  context.stroke();
  context.restore();
};

const paintScenery = (
  context: CanvasRenderingContext2D,
  run: Run,
  width: number,
  dark: boolean,
) => {
  const theme = run.seed % 4;
  const colors = dark
    ? ['#14213d', '#142c35', '#252039', '#241d42']
    : ['#ceddea', '#d4e6e5', '#e0dce8', '#e2d9ee'];
  const gradient = context.createLinearGradient(0, 0, 0, WORLD.height);
  gradient.addColorStop(0, colors[theme]);
  gradient.addColorStop(1, dark ? '#0c1728' : '#e9f4f6');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, WORLD.height);
  for (let layer = 0; layer < 2; layer++) {
    const spacing = theme === 1 ? 240 : 100;
    const scroll = run.camera * (layer === 0 ? 0.12 : 0.25);
    const first = Math.floor(scroll / spacing);
    for (let i = first; i < first + Math.ceil(width / spacing) + 2; i++) {
      const random = randomSource(
        run.seed ^ Math.imul(i + 1, 8191) ^ (layer * 997),
      );
      const x = i * spacing - scroll;
      const height = 80 + random() * 190;
      const y = 50 + random() * 320;
      context.fillStyle = dark
        ? layer
          ? '#253d55'
          : '#1a2d45'
        : layer
          ? '#aabfcf'
          : '#bccfdd';
      context.strokeStyle = dark ? '#46647a' : '#92b0c2';
      if (theme === 0) {
        const top = WORLD.height - height;
        context.fillRect(x, top, 65, height);
        context.fillRect(x + 28, top - 25, 4, 25);
        context.fillStyle = dark ? '#729bb0' : '#e3eff6';
        for (let row = top + 12; row < WORLD.height; row += 23)
          for (let col = 10; col < 60; col += 18)
            if (random() > 0.4) context.fillRect(x + col, row, 5, 8);
      } else if (theme === 1) {
        context.lineWidth = 12;
        context.strokeRect(x + 20, 18, 160, WORLD.height - 36);
        context.lineWidth = 2;
        context.beginPath();
        context.arc(x + 100, 240, 56, 0, Math.PI * 2);
        context.stroke();
        context.fillRect(x + 45, 227, 110, 26);
      } else if (theme === 2) {
        context.beginPath();
        context.ellipse(
          x + 35,
          y,
          18 + random() * 28,
          12 + random() * 20,
          random() * Math.PI,
          0,
          Math.PI * 2,
        );
        context.fill();
        context.stroke();
      } else {
        const glow = context.createRadialGradient(
          x + 40,
          y,
          1,
          x + 40,
          y,
          height,
        );
        glow.addColorStop(0, dark ? '#795ca52a' : '#9c76bb25');
        glow.addColorStop(1, '#795ca500');
        context.fillStyle = glow;
        context.fillRect(x - height, y - height, height * 2, height * 2);
      }
      if (theme >= 2) {
        context.fillStyle = dark ? '#9aacc2' : '#8a95ad';
        for (let star = 0; star < 6; star++)
          context.fillRect(
            x + random() * spacing,
            random() * WORLD.height,
            2,
            2,
          );
      }
    }
  }
};

export const paint = (
  canvas: HTMLCanvasElement,
  run: Run,
  dark: boolean,
  scenery = true,
) => {
  const context = canvas.getContext('2d');
  if (!context) return;
  const width = Math.max(680, Math.min(1100, canvas.clientWidth * 1.5));
  // Preserve the runner's distance from center when the viewport changes.
  run.camera += (run.viewWidth - width) / 2;
  run.viewWidth = width;
  if (run.status === 'ready' || run.camera + centerOffset(run) === 0)
    run.dog.x = run.camera + 8;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(canvas.clientWidth * ratio);
  const pixelHeight = Math.round(canvas.clientHeight * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  context.setTransform(
    canvas.width / width,
    0,
    0,
    canvas.height / WORLD.height,
    0,
    0,
  );
  const background = dark ? '#0c1728' : '#e9f4f6';
  const grid = dark ? '#1b3046' : '#d0e3e7';
  const rail = dark ? '#30465c' : '#aac5cf';
  const accent = dark ? '#60ead7' : '#087f78';
  context.fillStyle = background;
  context.fillRect(0, 0, width, WORLD.height);
  if (scenery) paintScenery(context, run, width, dark);
  context.strokeStyle = grid;
  context.globalAlpha = scenery ? 0.25 : 1;
  context.lineWidth = 1;
  const shift = (run.camera * 0.25) % 48;
  for (let x = -shift; x < width; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, WORLD.height);
    context.stroke();
  }
  for (let y = 18; y < WORLD.height; y += 48) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
  context.globalAlpha = 1;
  for (const platform of platformsNear(run, run.camera, width)) {
    const x = platform.x - run.camera;
    context.fillStyle = rail;
    context.fillRect(x, platform.y, platform.width, platform.height);
    context.fillStyle =
      platform.effect === 'boost'
        ? dark
          ? '#8be76d'
          : '#3e761d'
        : platform.effect === 'slow'
          ? dark
            ? '#bb9bff'
            : '#7250b6'
          : accent;
    context.fillRect(x, platform.y, platform.width, 3);
    context.fillRect(x, platform.y + platform.height - 3, platform.width, 3);
    if (platform.effect) {
      context.fillRect(x, platform.y, platform.width, platform.height);
      context.strokeStyle = dark ? '#101f30' : '#ffffff';
      context.lineWidth = 2;
      for (let marker = 18; marker < platform.width - 12; marker += 30) {
        const direction = platform.effect === 'boost' ? 1 : -1;
        context.beginPath();
        context.moveTo(x + marker - direction * 5, platform.y + 5);
        context.lineTo(
          x + marker + direction * 2,
          platform.y + platform.height / 2,
        );
        context.lineTo(
          x + marker - direction * 5,
          platform.y + platform.height - 5,
        );
        context.stroke();
      }
    }
    context.strokeStyle = dark ? '#152b43' : '#54748c';
    context.lineWidth = 4;
    context.strokeRect(
      x + 2,
      platform.y + 2,
      platform.width - 4,
      platform.height - 4,
    );
  }
  paintShiba(context, run);
  paintPlayer(context, run, run, dark, 1);
  if (run.partner) {
    paintPlayer(context, run, run.partner, dark, 2);
    paintPlayerNumbers(context, run, dark);
  }
};

const paintPlayer = (
  context: CanvasRenderingContext2D,
  run: Run,
  player: Player,
  dark: boolean,
  number: 1 | 2,
) => {
  const accent =
    number === 1
      ? dark
        ? '#60ead7'
        : '#087f78'
      : dark
        ? '#8dbaff'
        : '#335dcb';
  const playerX = WORLD.playerX + player.distance - run.camera;
  const bob =
    run.status === 'running' && player.velocity === 0
      ? Math.sin(player.distance / 12) * 2
      : 0;
  context.save();
  context.translate(playerX + 14, player.y + 14 + bob);
  context.scale(1, player.gravity);
  context.fillStyle = accent;
  context.shadowColor = accent;
  context.shadowBlur = dark ? 14 : 0;
  context.beginPath();
  context.roundRect(-14, -14, 28, 28, 7);
  context.fill();
  context.shadowBlur = 0;
  context.fillStyle = '#0c1728';
  context.fillRect(-1, -8, 13, 8);
  context.fillStyle = '#efffff';
  context.fillRect(6, -6, 4, 3);
  context.fillStyle = accent;
  context.fillRect(-10, 14, 7, 5);
  context.fillRect(5, 14, 7, 5);
  context.restore();
  context.globalAlpha = 0.45;
  context.fillStyle = accent;
  for (let i = 0; i < 3; i++)
    context.fillRect(playerX - 15 - i * 13, player.y + 10, 7 - i, 4);
  context.globalAlpha = 1;
};

const paintPlayerNumbers = (
  context: CanvasRenderingContext2D,
  run: Run,
  dark: boolean,
) => {
  if (!run.partner) return;
  const margin = 12;
  const spacing = 24;
  const labels = [run, run.partner].map((player, index) => ({
    x: Math.max(
      margin + 3,
      Math.min(
        run.viewWidth - margin - 3,
        WORLD.playerX + player.distance - run.camera + WORLD.playerSize / 2,
      ),
    ),
    y: player.gravity === 1 ? player.y - 26 : player.y + WORLD.playerSize + 26,
    color:
      index === 0
        ? dark
          ? '#60ead7'
          : '#087f78'
        : dark
          ? '#8dbaff'
          : '#335dcb',
  }));
  const [first, second] = labels;
  const dy = second.y - first.y;
  if (Math.hypot(second.x - first.x, dy) < spacing) {
    const separation = Math.sqrt(spacing * spacing - dy * dy);
    const center = Math.max(
      margin + 3 + separation / 2,
      Math.min(
        run.viewWidth - margin - 3 - separation / 2,
        (first.x + second.x) / 2,
      ),
    );
    const direction = first.x <= second.x ? 1 : -1;
    first.x = center - (direction * separation) / 2;
    second.x = center + (direction * separation) / 2;
  }
  context.save();
  context.font = 'bold 18px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  for (const [index, label] of labels.entries()) {
    context.fillStyle = label.color;
    context.fillText(String(index + 1), label.x, label.y + 1);
  }
  context.restore();
};
