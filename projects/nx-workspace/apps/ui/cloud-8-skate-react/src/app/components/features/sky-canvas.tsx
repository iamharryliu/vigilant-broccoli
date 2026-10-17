import { useEffect, useRef } from 'react';

interface Puff {
  dx: number;
  dy: number;
  r: number;
  lit: number; // 0=shadow, 1=highlight
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  puffs: Puff[];
  w: number; // bounding width for wrap-around
}

const CLOUD_COUNT = 10;
const MAX_DEVICE_PIXEL_RATIO = 2;
const SKY_GRADIENT_STOPS: [number, string][] = [
  [0, '#1565a8'],
  [0.28, '#2e86c1'],
  [0.58, '#5dade2'],
  [0.82, '#85c1e9'],
  [1, '#d0eaf8'],
];

const buildCloud = (baseR: number, towerHeight: number): Puff[] => {
  const puffs: Puff[] = [];

  const baseCount = Math.round(5 + Math.random() * 4);
  const spread = baseR * 1.6;
  for (let i = 0; i < baseCount; i++) {
    const t = i / (baseCount - 1) - 0.5;
    const dx = t * spread * 2;
    const edgeFade = 1 - Math.abs(t) * 0.55;
    const r = baseR * (0.7 + Math.random() * 0.45) * edgeFade;
    puffs.push({ dx, dy: 0, r, lit: 0.1 + Math.random() * 0.15 });
  }

  const layers = Math.round(towerHeight);
  for (let layer = 1; layer <= layers; layer++) {
    const frac = layer / layers;
    const layerSpread = spread * (1 - frac * 0.6);
    const layerR = baseR * (0.55 + Math.random() * 0.3) * (1 - frac * 0.35);
    const count = Math.max(2, Math.round(baseCount * (1 - frac * 0.5)));
    const dy = -layer * baseR * (0.55 + Math.random() * 0.2);
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) - 0.5 : 0;
      const dx = t * layerSpread * 2 + (Math.random() - 0.5) * baseR * 0.3;
      const edgeFade = 1 - Math.abs(t) * 0.5;
      const r = layerR * (0.75 + Math.random() * 0.5) * edgeFade;
      const lit = 0.55 + frac * 0.42 + Math.random() * 0.08;
      puffs.push({ dx, dy, r, lit });
    }
  }

  return puffs.sort((a, b) => a.lit - b.lit);
};

const spawnCloud = (x: number, depthFrac: number, height: number): Cloud => {
  const baseR = 40 + depthFrac * 110 + Math.random() * 40;
  const towerH = 1.5 + Math.random() * 2.5;
  const puffs = buildCloud(baseR, towerH);
  const maxDx = Math.max(...puffs.map(p => Math.abs(p.dx) + p.r));
  return {
    x,
    y: height * (0.15 + (1 - depthFrac) * 0.35 + Math.random() * 0.15),
    speed: 0.12 + depthFrac * 0.55 + Math.random() * 0.1,
    puffs,
    w: maxDx * 2,
  };
};

const spawnClouds = (width: number, height: number): Cloud[] =>
  Array.from({ length: CLOUD_COUNT }, () =>
    spawnCloud(Math.random() * width, Math.random(), height),
  ).sort((a, b) => a.speed - b.speed);

const drawSky = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  SKY_GRADIENT_STOPS.forEach(([offset, color]) =>
    grad.addColorStop(offset, color),
  );
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
};

const drawCloud = (ctx: CanvasRenderingContext2D, { x, y, puffs }: Cloud) => {
  for (const p of puffs) {
    const px = x + p.dx;
    const py = y + p.dy;
    const r = p.r;

    const grad = ctx.createRadialGradient(
      px - r * 0.15,
      py - r * 0.35,
      r * 0.02,
      px,
      py,
      r,
    );

    const mid = Math.round(220 + p.lit * 30);
    const shadow = Math.round(165 + p.lit * 55);
    const shadowB = Math.round(190 + p.lit * 55);

    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, `rgba(${mid},${mid},${mid},0.96)`);
    grad.addColorStop(0.68, `rgba(${shadow},${shadow},${shadowB},0.72)`);
    grad.addColorStop(1, `rgba(${shadow},${shadow},${shadowB},0)`);

    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
};

export function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let clouds: Cloud[] = [];
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO,
      );
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      clouds = spawnClouds(width, height);
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      drawSky(ctx, width, height);

      clouds = clouds.map(cloud => {
        const moved = { ...cloud, x: cloud.x + cloud.speed };
        return moved.x - moved.w / 2 > width
          ? spawnCloud(-moved.w / 2, Math.random(), height)
          : moved;
      });
      clouds.forEach(cloud => drawCloud(ctx, cloud));

      raf = requestAnimationFrame(loop);
    };

    resize();
    loop();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
