export const WORLD = {
  height: 480,
  ceiling: 78,
  floor: 402,
  playerX: 126,
  playerSize: 28,
  step: 1 / 120,
  maxSpeed: 360,
} as const;

export type Status = 'ready' | 'running' | 'paused' | 'over';
export type Run = {
  distance: number;
  y: number;
  velocity: number;
  gravity: 1 | -1;
  status: Status;
};
export type Hazard = {
  x: number;
  width: number;
  side: 1 | -1;
  kind: 'barrier' | 'gap';
};

// The widest hazard leaves >1.2 s of clear rail before the next hazard at
// the speed cap. No segment can block both rails at once.
const PATTERN: ReadonlyArray<Pick<Hazard, 'side' | 'kind'>> = [
  { side: 1, kind: 'barrier' },
  { side: -1, kind: 'barrier' },
  { side: 1, kind: 'gap' },
  { side: -1, kind: 'barrier' },
  { side: -1, kind: 'gap' },
  { side: 1, kind: 'barrier' },
  { side: -1, kind: 'gap' },
  { side: 1, kind: 'gap' },
];
const FIRST_HAZARD = 1000;
const SEGMENT_LENGTH = 720;
const BARRIER_HEIGHT = 112;
export const createRun = (): Run => ({
  distance: 0,
  y: WORLD.floor - WORLD.playerSize,
  velocity: 0,
  gravity: 1,
  status: 'ready',
});
export const speedOf = (run: Run) =>
  Math.min(WORLD.maxSpeed, 240 + run.distance / 120);
export const scoreOf = (run: Run) => Math.floor(run.distance / 10);
export const hazardsNear = (distance: number, width: number): Hazard[] => {
  const first = Math.max(
    0,
    Math.floor((distance - FIRST_HAZARD - 200) / SEGMENT_LENGTH),
  );
  const last = Math.max(
    0,
    Math.ceil((distance + width - FIRST_HAZARD) / SEGMENT_LENGTH),
  );
  return Array.from({ length: last - first + 1 }, (_, offset) => {
    const index = first + offset;
    const pattern = PATTERN[index % PATTERN.length];
    return {
      ...pattern,
      x: FIRST_HAZARD + index * SEGMENT_LENGTH,
      width: pattern.kind === 'gap' ? 190 : 100,
    };
  });
};
export const flip = (run: Run) => {
  if (run.status !== 'running') return;
  run.gravity = run.gravity === 1 ? -1 : 1;
  run.velocity = run.gravity * 220;
};
export const advance = (run: Run) => {
  if (run.status !== 'running') return;
  run.distance += speedOf(run) * WORLD.step;
  const hazards = hazardsNear(run.distance, WORLD.playerX + WORLD.playerSize);
  const x = run.distance + WORLD.playerX;
  const overlaps = (hazard: Hazard) =>
    x + WORLD.playerSize > hazard.x && x < hazard.x + hazard.width;
  const support = (side: 1 | -1) =>
    !hazards.some(
      hazard =>
        hazard.kind === 'gap' && hazard.side === side && overlaps(hazard),
    );
  const previousY = run.y;
  run.velocity += run.gravity * 2400 * WORLD.step;
  run.y += run.velocity * WORLD.step;
  if (
    run.velocity >= 0 &&
    previousY + WORLD.playerSize <= WORLD.floor &&
    run.y + WORLD.playerSize >= WORLD.floor &&
    support(1)
  ) {
    run.y = WORLD.floor - WORLD.playerSize;
    run.velocity = 0;
  }
  if (
    run.velocity <= 0 &&
    previousY >= WORLD.ceiling &&
    run.y <= WORLD.ceiling &&
    support(-1)
  ) {
    run.y = WORLD.ceiling;
    run.velocity = 0;
  }
  const hit = hazards.some(hazard => {
    if (hazard.kind !== 'barrier' || !overlaps(hazard)) return false;
    const top =
      hazard.side === 1 ? WORLD.floor - BARRIER_HEIGHT : WORLD.ceiling;
    return run.y + WORLD.playerSize > top && run.y < top + BARRIER_HEIGHT;
  });
  if (hit || run.y > WORLD.height || run.y + WORLD.playerSize < 0)
    run.status = 'over';
};

export const paint = (canvas: HTMLCanvasElement, run: Run, dark: boolean) => {
  const context = canvas.getContext('2d');
  if (!context) return;
  const width = Math.max(680, Math.min(1100, canvas.clientWidth * 1.5));
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
  context.strokeStyle = grid;
  context.lineWidth = 1;
  const shift = (run.distance * 0.25) % 48;
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
  context.fillStyle = rail;
  context.fillRect(0, 42, width, 36);
  context.fillRect(0, WORLD.floor, width, 36);
  context.fillStyle = accent;
  context.fillRect(0, WORLD.ceiling - 4, width, 4);
  context.fillRect(0, WORLD.floor, width, 4);
  for (const hazard of hazardsNear(run.distance, width)) {
    const x = hazard.x - run.distance;
    const top = hazard.side === -1;
    if (hazard.kind === 'gap') {
      context.fillStyle = background;
      context.fillRect(x, top ? 40 : WORLD.floor, hazard.width, 40);
      context.strokeStyle = '#f18659';
      context.setLineDash([5, 7]);
      context.strokeRect(x, top ? 48 : WORLD.floor + 8, hazard.width, 24);
      context.setLineDash([]);
    } else {
      const y = top ? WORLD.ceiling : WORLD.floor - BARRIER_HEIGHT;
      context.fillStyle = dark ? '#f47f67' : '#c44839';
      context.fillRect(x, y, hazard.width, BARRIER_HEIGHT);
      context.save();
      context.beginPath();
      context.rect(x, y, hazard.width, BARRIER_HEIGHT);
      context.clip();
      context.strokeStyle = dark ? '#9d443e' : '#f79477';
      context.lineWidth = 9;
      for (let stripe = -100; stripe < 220; stripe += 28) {
        context.beginPath();
        context.moveTo(x + stripe, y);
        context.lineTo(x + stripe + 112, y + 112);
        context.stroke();
      }
      context.restore();
    }
  }
  const bob =
    run.status === 'running' && run.velocity === 0
      ? Math.sin(run.distance / 12) * 2
      : 0;
  context.save();
  context.translate(WORLD.playerX + 14, run.y + 14 + bob);
  context.scale(1, run.gravity);
  context.fillStyle = dark ? '#60ead7' : '#087f78';
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
    context.fillRect(WORLD.playerX - 15 - i * 13, run.y + 10, 7 - i, 4);
  context.globalAlpha = 1;
};
