import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

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

@Component({
  selector: 'app-sky-canvas',
  template: '<canvas #canvas class="w-full h-full"></canvas>',
})
export class SkyCanvasComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private raf = 0;
  private clouds: Cloud[] = [];
  private W = 0;
  private H = 0;

  ngOnInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.resize();
    this.spawnClouds();
    this.loop();
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = () => {
    this.resize();
    this.spawnClouds();
  };

  private resize() {
    const canvas = this.canvasRef.nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = canvas.offsetWidth;
    this.H = canvas.offsetHeight;
    canvas.width = this.W * dpr;
    canvas.height = this.H * dpr;
    this.ctx.scale(dpr, dpr);
  }

  private buildCloud(baseR: number, towerHeight: number): Puff[] {
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
  }

  private spawnCloud(x: number, depthFrac: number): Cloud {
    const baseR = 40 + depthFrac * 110 + Math.random() * 40;
    const towerH = 1.5 + Math.random() * 2.5;
    const puffs = this.buildCloud(baseR, towerH);
    const maxDx = Math.max(...puffs.map(p => Math.abs(p.dx) + p.r));
    return {
      x,
      y: this.H * (0.15 + (1 - depthFrac) * 0.35 + Math.random() * 0.15),
      speed: 0.12 + depthFrac * 0.55 + Math.random() * 0.1,
      puffs,
      w: maxDx * 2,
    };
  }

  private spawnClouds() {
    const CLOUD_COUNT = 10;
    this.clouds = [];
    for (let i = 0; i < CLOUD_COUNT; i++) {
      this.clouds.push(this.spawnCloud(Math.random() * this.W, Math.random()));
    }
    this.clouds.sort((a, b) => a.speed - b.speed);
  }

  private drawSky() {
    const { ctx, W, H } = this;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1565a8');
    grad.addColorStop(0.28, '#2e86c1');
    grad.addColorStop(0.58, '#5dade2');
    grad.addColorStop(0.82, '#85c1e9');
    grad.addColorStop(1, '#d0eaf8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  private drawCloud(cloud: Cloud) {
    const { ctx } = this;
    const { x, y, puffs } = cloud;

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
  }

  private loop = () => {
    const { ctx, W, H, clouds } = this;

    ctx.clearRect(0, 0, W, H);
    this.drawSky();

    for (const cloud of clouds) {
      cloud.x += cloud.speed;
      if (cloud.x - cloud.w / 2 > W) {
        const fresh = this.spawnCloud(-cloud.w / 2, Math.random());
        cloud.x = fresh.x;
        cloud.y = fresh.y;
        cloud.speed = fresh.speed;
        cloud.puffs = fresh.puffs;
        cloud.w = fresh.w;
      }
      this.drawCloud(cloud);
    }

    this.raf = requestAnimationFrame(this.loop);
  };
}
