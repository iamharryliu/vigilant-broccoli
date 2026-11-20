'use client';

import { useEffect, useRef } from 'react';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type ForceLink,
  type ForceManyBody,
  type ForceX,
  type ForceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { NoteGraph } from './DocsExplorer';
import { isDarkTheme, PREFERS_DARK_QUERY } from './theme';

interface SimNode extends SimulationNodeDatum {
  id: string;
  name: string;
  group: string;
  degree: number;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  value?: number;
}

const CFG = {
  COLLIDE_PAD: 4,
  NODE_MIN_R: 3,
  NODE_R_STEP: 1.4,
  HIT_PAD: 4,
  LINK_WIDTH: 1.2,
  LINK_WIDTH_MAX: 4,
  LABEL_FONT_PX: 11,
  LABEL_ZOOM: 1.4,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 6,
  ZOOM_STEP: 1.15,
  FIT_PADDING: 40,
  DRAG_THRESHOLD_PX: 4,
  ALPHA_DRAG: 0.3,
  ALPHA_FORCE_UPDATE: 0.6,
  // Glow radius is in world units so it scales with zoom, floored to stay visible zoomed out.
  ACTIVE_GLOW_RADIUS: 160,
  ACTIVE_GLOW_MIN_PX: 48,
  HOVER_GLOW_SCALE: 0.6,
  // Per-node glow radius as a multiple of the node's radius, and its peak alpha.
  NODE_GLOW_SCALE: 4,
  NODE_GLOW_ALPHA_LIGHT: 0.18,
  NODE_GLOW_ALPHA_DARK: 0.25,
  GLOW_FADE_STOPS: 12,
  HOVER_NODE_SCALE: 1.35,
  HOVER_GROW_MS: 150,
  HOVER_LABEL_FONT_PX: 12,
} as const;

export interface GraphForces {
  center: number;
  repel: number;
  link: number;
  linkDistance: number;
}

export const DEFAULT_FORCES: GraphForces = {
  center: 0.08,
  repel: 280,
  link: 0.5,
  linkDistance: 75,
};

export const FORCE_LIMITS: Record<
  keyof GraphForces,
  { min: number; max: number; step: number }
> = {
  // Each range is symmetric around its DEFAULT_FORCES value so sliders start centered.
  center: { min: 0, max: 0.16, step: 0.01 },
  repel: { min: 0, max: 560, step: 10 },
  link: { min: 0, max: 1, step: 0.05 },
  linkDistance: { min: 10, max: 140, step: 5 },
};

const COLOR = {
  ROOT_LIGHT: '#6b7280',
  ROOT_DARK: '#9ca3af',
  LINK_LIGHT: 'rgba(0,0,0,0.13)',
  LINK_DARK: 'rgba(255,255,255,0.15)',
  LINK_HL: 'rgba(59,130,246,0.75)',
  ACCENT: '#3b82f6',
  LABEL_LIGHT: '#374151',
  LABEL_DARK: '#d1d5db',
  DIM_ALPHA: 0.15,
} as const;

interface GlowStyle {
  LIGHT: string;
  DARK: string;
  PEAK_LIGHT: number;
  PEAK_DARK: number;
}

// Blue marks the open note; amber marks the hovered one so the two read apart.
const ACTIVE_GLOW: GlowStyle = {
  LIGHT: '#3b82f6',
  DARK: '#60a5fa',
  PEAK_LIGHT: 0.28,
  PEAK_DARK: 0.35,
};

const HOVER_GLOW: GlowStyle = {
  LIGHT: '#f59e0b',
  DARK: '#fbbf24',
  PEAK_LIGHT: 0.3,
  PEAK_DARK: 0.35,
};

const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';

const EVENT = {
  POINTER_DOWN: 'pointerdown',
  POINTER_MOVE: 'pointermove',
  POINTER_UP: 'pointerup',
  POINTER_CANCEL: 'pointercancel',
  WHEEL: 'wheel',
  CHANGE: 'change',
} as const;

const groupHash = (group: string): number => {
  let hash = 0;
  for (let i = 0; i < group.length; i++)
    hash = (hash * 31 + group.charCodeAt(i)) >>> 0;
  return hash;
};

// Palette colors are picked by hash, not by position in the current graph,
// so a folder keeps its colour when the local subgraph changes.
const nodeColor = (
  group: string,
  dark: boolean,
  palette: readonly string[] | undefined,
  groupColors?: Readonly<Record<string, string>>,
): string => {
  if (groupColors?.[group]) return groupColors[group];
  if (!group) return dark ? COLOR.ROOT_DARK : COLOR.ROOT_LIGHT;
  if (palette?.length) return palette[groupHash(group) % palette.length];
  return `hsl(${groupHash(group) % 360} 65% ${dark ? 62 : 46}%)`;
};

// Handles the #rrggbb and hsl() colors nodeColor and the glow styles produce.
const withAlpha = (color: string, alpha: number): string =>
  color.startsWith('#')
    ? `${color}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, '0')}`
    : color.replace(')', ` / ${alpha})`);

// A cosine falloff sampled into many stops: two or three linear stops leave
// a visible bright core and kinks where the slope changes. Every stop keeps
// the glow's own color, since fading to `transparent` (black) darkens the edge.
const addFadeStops = (
  gradient: CanvasGradient,
  color: string,
  peak: number,
) => {
  for (let i = 0; i <= CFG.GLOW_FADE_STOPS; i++) {
    const t = i / CFG.GLOW_FADE_STOPS;
    gradient.addColorStop(
      t,
      withAlpha(color, peak * (0.5 + 0.5 * Math.cos(Math.PI * t))),
    );
  }
};

// A glow is the same faded disc for a given color and peak, so it is rendered
// once to an offscreen canvas and scaled with drawImage. Building a fresh
// many-stop radial gradient per node per frame dominated each draw.
const GLOW_SPRITE_PX = 256;
const glowSprites = new Map<string, HTMLCanvasElement>();
const glowSprite = (color: string, peak: number): HTMLCanvasElement => {
  const key = `${color}|${peak}`;
  const cached = glowSprites.get(key);
  if (cached) return cached;
  const sprite = document.createElement('canvas');
  sprite.width = GLOW_SPRITE_PX;
  sprite.height = GLOW_SPRITE_PX;
  const spriteCtx = sprite.getContext('2d');
  if (spriteCtx) {
    const r = GLOW_SPRITE_PX / 2;
    const glow = spriteCtx.createRadialGradient(r, r, 0, r, r, r);
    addFadeStops(glow, color, peak);
    spriteCtx.fillStyle = glow;
    spriteCtx.fillRect(0, 0, GLOW_SPRITE_PX, GLOW_SPRITE_PX);
  }
  glowSprites.set(key, sprite);
  return sprite;
};

const nodeRadius = (degree: number): number =>
  CFG.NODE_MIN_R + Math.sqrt(degree) * CFG.NODE_R_STEP;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

const linkWidth = (value: number | undefined): number =>
  value == null
    ? CFG.LINK_WIDTH
    : Math.min(CFG.LINK_WIDTH_MAX, CFG.LINK_WIDTH + Math.log2(1 + value));

const endpointId = (end: SimLink['source']): string =>
  typeof end === 'object' ? (end as SimNode).id : String(end);

export function buildAdjacency(graph: NoteGraph): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  for (const node of graph.nodes) adjacency.set(node.id, new Set());
  for (const link of graph.links) {
    if (!adjacency.has(link.source) || !adjacency.has(link.target)) continue;
    adjacency.get(link.source)?.add(link.target);
    adjacency.get(link.target)?.add(link.source);
  }
  return adjacency;
}

export function localSubgraph(
  graph: NoteGraph,
  rootPath: string,
  depth: number,
): NoteGraph {
  const adjacency = buildAdjacency(graph);
  if (!adjacency.has(rootPath)) return { nodes: [], links: [] };

  const visited = new Set([rootPath]);
  let frontier = [rootPath];
  for (let hop = 0; hop < depth; hop++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const neighbor of adjacency.get(id) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        next.push(neighbor);
      }
    }
    frontier = next;
  }

  return {
    nodes: graph.nodes.filter(n => visited.has(n.id)),
    links: graph.links.filter(
      l => visited.has(l.source) && visited.has(l.target),
    ),
  };
}

export interface GraphViewProps {
  graph: NoteGraph;
  activePath?: string;
  onSelect: (path: string) => void;
  forces?: GraphForces;
  // Omitted keeps the hashed per-group hues.
  palette?: readonly string[];
  // Fixed colors for named groups, checked before the palette and hashed hues;
  // must be #rrggbb or hsl() so the glows can add alpha.
  groupColors?: Readonly<Record<string, string>>;
  // The faint per-node glows; the open-note and hover highlights always draw.
  showNodeGlow?: boolean;
  // Labels for corner zoom in/out/reset buttons; omitted renders no buttons.
  zoomControls?: GraphZoomControlLabels;
  // A click (not a pan) on empty canvas, e.g. to clear a selection.
  onBackgroundClick?: () => void;
}

export interface GraphZoomControlLabels {
  zoomIn: string;
  zoomOut: string;
  reset: string;
}

const ZOOM_BUTTON_CLASS =
  'flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-sky-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100';
const ZOOM_ICON_CLASS = 'h-4 w-4 shrink-0';

export function GraphView({
  graph,
  activePath,
  onSelect,
  forces = DEFAULT_FORCES,
  palette,
  groupColors,
  showNodeGlow = true,
  zoomControls,
  onBackgroundClick,
}: GraphViewProps) {
  // Read through a ref so a new callback each render does not rebuild the
  // simulation, which the mount effect keys on.
  const onBackgroundClickRef = useRef(onBackgroundClick);
  onBackgroundClickRef.current = onBackgroundClick;
  const paletteRef = useRef(palette);
  paletteRef.current = palette;
  const groupColorsRef = useRef(groupColors);
  groupColorsRef.current = groupColors;
  const showNodeGlowRef = useRef(showNodeGlow);
  showNodeGlowRef.current = showNodeGlow;
  const drawRef = useRef<(() => void) | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePathRef = useRef(activePath);
  activePathRef.current = activePath;
  const forcesRef = useRef(forces);
  forcesRef.current = forces;
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const linkForceRef = useRef<ForceLink<SimNode, SimLink> | null>(null);
  const chargeForceRef = useRef<ForceManyBody<SimNode> | null>(null);
  const xForceRef = useRef<ForceX<SimNode> | null>(null);
  const yForceRef = useRef<ForceY<SimNode> | null>(null);
  const refitRef = useRef<(() => void) | null>(null);
  const zoomByRef = useRef<((factor: number) => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes: SimNode[] = graph.nodes.map(n => ({ ...n, degree: 0 }));
    const nodeById = new Map(nodes.map(n => [n.id, n]));
    const links: SimLink[] = [];
    const neighbors = buildAdjacency(graph);
    for (const link of graph.links) {
      const source = nodeById.get(link.source);
      const target = nodeById.get(link.target);
      if (!source || !target) continue;
      links.push({ source: source.id, target: target.id, value: link.value });
      source.degree++;
      target.degree++;
    }

    const transform = { k: 1, x: 0, y: 0 };
    let hoveredId: string | null = null;
    // Hover grow progress (0–1) per node; nodes leave the map once shrunk back.
    const growth = new Map<string, number>();
    let growFrame: number | null = null;
    let growLastTs = 0;
    let userInteracted = false;
    let followLayout = true;
    let width = container.clientWidth;
    let height = container.clientHeight;

    const toScreen = (n: SimNode) => ({
      sx: (n.x ?? 0) * transform.k + transform.x,
      sy: (n.y ?? 0) * transform.k + transform.y,
    });
    const toWorld = (px: number, py: number) => ({
      wx: (px - transform.x) / transform.k,
      wy: (py - transform.y) / transform.k,
    });

    // Centers on the open note when there is one, zooming out far enough that
    // the farthest node on each axis still fits; otherwise fits the bounding box.
    const fitToView = () => {
      if (nodes.length === 0) return;
      const active = activePathRef.current;
      const anchor = active ? nodeById.get(active) : undefined;
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const n of nodes) {
        minX = Math.min(minX, n.x ?? 0);
        minY = Math.min(minY, n.y ?? 0);
        maxX = Math.max(maxX, n.x ?? 0);
        maxY = Math.max(maxY, n.y ?? 0);
      }
      const cx = anchor ? (anchor.x ?? 0) : (minX + maxX) / 2;
      const cy = anchor ? (anchor.y ?? 0) : (minY + maxY) / 2;
      const spanX = 2 * Math.max(cx - minX, maxX - cx) || 1;
      const spanY = 2 * Math.max(cy - minY, maxY - cy) || 1;
      const k = Math.min(
        (width - CFG.FIT_PADDING * 2) / spanX,
        (height - CFG.FIT_PADDING * 2) / spanY,
        CFG.MAX_ZOOM,
      );
      transform.k = Math.max(k, CFG.MIN_ZOOM);
      transform.x = width / 2 - cx * transform.k;
      transform.y = height / 2 - cy * transform.k;
    };

    // isDarkTheme reads computed styles up the ancestor chain, which forces a
    // style recalculation; it runs only on mount and on theme changes.
    let darkTheme = isDarkTheme(container);

    const draw = () => {
      const dark = darkTheme;
      const dpr = window.devicePixelRatio || 1;
      const groupColorCache = new Map<string, string>();
      const colorFor = (group: string) => {
        let color = groupColorCache.get(group);
        if (color === undefined) {
          color = nodeColor(
            group,
            dark,
            paletteRef.current,
            groupColorsRef.current,
          );
          groupColorCache.set(group, color);
        }
        return color;
      };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const active = activePathRef.current;
      const activeId = active && nodeById.has(active) ? active : null;
      const focusId = hoveredId ?? activeId;
      const dimming = hoveredId != null;
      const focusSet = focusId ? neighbors.get(focusId) : null;
      const isLit = (id: string) =>
        !dimming || id === focusId || (focusSet?.has(id) ?? false);

      const drawnRadius = (n: SimNode) =>
        nodeRadius(n.degree) *
        (1 + (CFG.HOVER_NODE_SCALE - 1) * easeOutCubic(growth.get(n.id) ?? 0));
      const nodeGlowAlpha = dark
        ? CFG.NODE_GLOW_ALPHA_DARK
        : CFG.NODE_GLOW_ALPHA_LIGHT;
      for (const n of showNodeGlowRef.current ? nodes : []) {
        if (n.id === activeId) continue;
        const { sx, sy } = toScreen(n);
        const glowR = drawnRadius(n) * CFG.NODE_GLOW_SCALE;
        ctx.drawImage(
          glowSprite(
            colorFor(n.group),
            nodeGlowAlpha * (isLit(n.id) ? 1 : COLOR.DIM_ALPHA),
          ),
          sx - glowR,
          sy - glowR,
          glowR * 2,
          glowR * 2,
        );
      }

      const drawGlow = (node: SimNode, scale: number, style: GlowStyle) => {
        const { sx, sy } = toScreen(node);
        const glowR =
          Math.max(
            CFG.ACTIVE_GLOW_RADIUS * transform.k,
            CFG.ACTIVE_GLOW_MIN_PX,
          ) * scale;
        ctx.drawImage(
          glowSprite(
            dark ? style.DARK : style.LIGHT,
            dark ? style.PEAK_DARK : style.PEAK_LIGHT,
          ),
          sx - glowR,
          sy - glowR,
          glowR * 2,
          glowR * 2,
        );
      };
      const activeNode = activeId ? nodeById.get(activeId) : undefined;
      if (activeNode) drawGlow(activeNode, 1, ACTIVE_GLOW);
      const hoveredNode =
        hoveredId != null && hoveredId !== activeId
          ? nodeById.get(hoveredId)
          : undefined;
      if (hoveredNode) drawGlow(hoveredNode, CFG.HOVER_GLOW_SCALE, HOVER_GLOW);

      // Links sharing a stroke style, width and alpha go into one path, so a
      // frame strokes a handful of paths instead of one per link.
      const linkColor = dark ? COLOR.LINK_DARK : COLOR.LINK_LIGHT;
      const linkBatches = new Map<
        string,
        { style: string; width: number; alpha: number; path: Path2D }
      >();
      for (const link of links) {
        const s = nodeById.get(endpointId(link.source));
        const t = nodeById.get(endpointId(link.target));
        if (!s || !t) continue;
        const touchesFocus =
          focusId != null && (s.id === focusId || t.id === focusId);
        const dimmed = dimming && !touchesFocus;
        const style = !dimmed && touchesFocus ? COLOR.LINK_HL : linkColor;
        const alpha = dimmed ? COLOR.DIM_ALPHA : 1;
        const width = linkWidth(link.value);
        const key = `${style}|${width}|${alpha}`;
        let batch = linkBatches.get(key);
        if (!batch) {
          batch = { style, width, alpha, path: new Path2D() };
          linkBatches.set(key, batch);
        }
        const a = toScreen(s);
        const b = toScreen(t);
        batch.path.moveTo(a.sx, a.sy);
        batch.path.lineTo(b.sx, b.sy);
      }
      // Dimmed links first and highlighted last, matching what drawing in
      // link order produced: the focus edges stay on top.
      const batchOrder = (batch: { style: string; alpha: number }) =>
        batch.style === COLOR.LINK_HL ? 2 : batch.alpha < 1 ? 0 : 1;
      const orderedBatches = [...linkBatches.values()].sort(
        (a, b) => batchOrder(a) - batchOrder(b),
      );
      for (const { style, width, alpha, path } of orderedBatches) {
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = style;
        ctx.lineWidth = width;
        ctx.stroke(path);
      }

      ctx.globalAlpha = 1;
      const showAllLabels = transform.k >= CFG.LABEL_ZOOM;
      ctx.font = `${CFG.LABEL_FONT_PX}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const n of nodes) {
        const { sx, sy } = toScreen(n);
        const r = drawnRadius(n);
        const lit = isLit(n.id);
        ctx.globalAlpha = n.id === active || lit ? 1 : COLOR.DIM_ALPHA;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = n.id === active ? COLOR.ACCENT : colorFor(n.group);
        ctx.fill();
        const isFocusNeighbor =
          hoveredId != null && (focusSet?.has(n.id) ?? false);
        const labelled =
          n.id === focusId ||
          n.id === active ||
          isFocusNeighbor ||
          (showAllLabels && lit);
        if (labelled) {
          ctx.globalAlpha = lit ? 1 : COLOR.DIM_ALPHA;
          ctx.fillStyle = dark ? COLOR.LABEL_DARK : COLOR.LABEL_LIGHT;
          if (n.id === hoveredId) {
            ctx.font = `600 ${CFG.HOVER_LABEL_FONT_PX}px sans-serif`;
            ctx.fillText(n.name, sx, sy + r + 2);
            ctx.font = `${CFG.LABEL_FONT_PX}px sans-serif`;
          } else {
            ctx.fillText(n.name, sx, sy + r + 2);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const f0 = forcesRef.current;
    const linkForce = forceLink<SimNode, SimLink>(links)
      .id(d => d.id)
      .distance(f0.linkDistance)
      .strength(f0.link);
    const chargeForce = forceManyBody<SimNode>().strength(-f0.repel);
    const xForce = forceX<SimNode>(0).strength(f0.center);
    const yForce = forceY<SimNode>(0).strength(f0.center);
    linkForceRef.current = linkForce;
    chargeForceRef.current = chargeForce;
    xForceRef.current = xForce;
    yForceRef.current = yForce;

    const sim: Simulation<SimNode, SimLink> = forceSimulation(nodes)
      .force('link', linkForce)
      .force('charge', chargeForce)
      .force('center', forceCenter(0, 0))
      .force('x', xForce)
      .force('y', yForce)
      .force(
        'collide',
        forceCollide<SimNode>().radius(
          d => nodeRadius(d.degree) + CFG.COLLIDE_PAD,
        ),
      )
      .on('tick', () => {
        if (followLayout && !userInteracted) fitToView();
        draw();
      })
      // After the first settle the camera stays put: later force changes and
      // drags move the nodes, not the view. Reset refits explicitly.
      .on('end', () => {
        followLayout = false;
      });
    simRef.current = sim;

    const stepGrow = (ts: number) => {
      const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
      const delta = reduceMotion
        ? 1
        : (ts - (growLastTs || ts)) / CFG.HOVER_GROW_MS;
      growLastTs = ts;
      if (hoveredId != null && !growth.has(hoveredId)) growth.set(hoveredId, 0);
      let settled = true;
      for (const [id, progress] of growth) {
        const target = id === hoveredId ? 1 : 0;
        const next =
          target > progress
            ? Math.min(progress + delta, 1)
            : Math.max(progress - delta, 0);
        if (next === 0 && target === 0) growth.delete(id);
        else growth.set(id, next);
        if (next !== target) settled = false;
      }
      draw();
      growFrame = settled ? null : requestAnimationFrame(stepGrow);
    };
    const startGrow = () => {
      if (growFrame != null) return;
      growLastTs = 0;
      growFrame = requestAnimationFrame(stepGrow);
    };

    // Pointer and wheel events can arrive several times per frame; drawing on
    // each one queues redundant full repaints that a long pan or zoom falls
    // behind on. Coalesce them into at most one draw per animation frame.
    let drawFrame: number | null = null;
    const scheduleDraw = () => {
      if (drawFrame != null) return;
      drawFrame = requestAnimationFrame(() => {
        drawFrame = null;
        draw();
      });
    };

    drawRef.current = draw;
    refitRef.current = () => {
      userInteracted = false;
      fitToView();
      draw();
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (!userInteracted) fitToView();
      draw();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const nodeAt = (px: number, py: number): SimNode | null => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const { sx, sy } = toScreen(n);
        const r = nodeRadius(n.degree) + CFG.HIT_PAD;
        if ((px - sx) ** 2 + (py - sy) ** 2 <= r * r) return n;
      }
      return null;
    };

    let dragNode: SimNode | null = null;
    let panning = false;
    let pointerId: number | null = null;
    let downX = 0;
    let downY = 0;
    let moved = false;

    const localPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { px: e.clientX - rect.left, py: e.clientY - rect.top };
    };

    const onPointerDown = (e: PointerEvent) => {
      const { px, py } = localPoint(e);
      pointerId = e.pointerId;
      canvas.setPointerCapture(e.pointerId);
      downX = px;
      downY = py;
      moved = false;
      const hit = nodeAt(px, py);
      if (hit) {
        dragNode = hit;
        sim.alphaTarget(CFG.ALPHA_DRAG).restart();
      } else {
        panning = true;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const { px, py } = localPoint(e);
      if (pointerId === null) {
        const hit = nodeAt(px, py);
        const nextHover = hit?.id ?? null;
        canvas.style.cursor = hit ? 'pointer' : 'grab';
        if (nextHover !== hoveredId) {
          hoveredId = nextHover;
          startGrow();
          scheduleDraw();
        }
        return;
      }
      if (
        Math.abs(px - downX) > CFG.DRAG_THRESHOLD_PX ||
        Math.abs(py - downY) > CFG.DRAG_THRESHOLD_PX
      ) {
        moved = true;
        userInteracted = true;
      }
      if (dragNode) {
        const { wx, wy } = toWorld(px, py);
        dragNode.fx = wx;
        dragNode.fy = wy;
      } else if (panning) {
        transform.x += px - downX;
        transform.y += py - downY;
        downX = px;
        downY = py;
        scheduleDraw();
      }
    };

    const endPointer = (e: PointerEvent) => {
      const { px, py } = localPoint(e);
      if (dragNode) {
        if (!moved) onSelect(dragNode.id);
        dragNode.fx = null;
        dragNode.fy = null;
        sim.alphaTarget(0);
        dragNode = null;
      } else if (panning && !moved) {
        const hit = nodeAt(px, py);
        if (hit) onSelect(hit.id);
        else onBackgroundClickRef.current?.();
      }
      panning = false;
      pointerId = null;
      canvas.style.cursor = 'grab';
    };

    // Zooms keeping the world point under (px, py) fixed on screen.
    const zoomAt = (px: number, py: number, factor: number) => {
      userInteracted = true;
      const { wx, wy } = toWorld(px, py);
      transform.k = Math.min(
        CFG.MAX_ZOOM,
        Math.max(CFG.MIN_ZOOM, transform.k * factor),
      );
      transform.x = px - wx * transform.k;
      transform.y = py - wy * transform.k;
      scheduleDraw();
    };
    zoomByRef.current = factor => zoomAt(width / 2, height / 2, factor);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      zoomAt(
        e.clientX - rect.left,
        e.clientY - rect.top,
        e.deltaY < 0 ? CFG.ZOOM_STEP : 1 / CFG.ZOOM_STEP,
      );
    };

    canvas.addEventListener(EVENT.POINTER_DOWN, onPointerDown);
    canvas.addEventListener(EVENT.POINTER_MOVE, onPointerMove);
    canvas.addEventListener(EVENT.POINTER_UP, endPointer);
    canvas.addEventListener(EVENT.POINTER_CANCEL, endPointer);
    canvas.addEventListener(EVENT.WHEEL, onWheel, { passive: false });

    const refreshTheme = () => {
      darkTheme = isDarkTheme(container);
      draw();
    };
    const themeObserver = new MutationObserver(refreshTheme);
    // A scoped ThemeProvider flips class/style on its own wrapper, not on <html>.
    for (
      let node: HTMLElement | null = container;
      node;
      node = node.parentElement
    ) {
      themeObserver.observe(node, {
        attributes: true,
        attributeFilter: [CLASS_ATTR, STYLE_ATTR],
      });
    }
    const media = window.matchMedia?.(PREFERS_DARK_QUERY);
    media?.addEventListener(EVENT.CHANGE, refreshTheme);

    return () => {
      if (growFrame != null) cancelAnimationFrame(growFrame);
      if (drawFrame != null) cancelAnimationFrame(drawFrame);
      refitRef.current = null;
      zoomByRef.current = null;
      drawRef.current = null;
      sim.stop();
      simRef.current = null;
      resizeObserver.disconnect();
      themeObserver.disconnect();
      media?.removeEventListener(EVENT.CHANGE, refreshTheme);
      canvas.removeEventListener(EVENT.POINTER_DOWN, onPointerDown);
      canvas.removeEventListener(EVENT.POINTER_MOVE, onPointerMove);
      canvas.removeEventListener(EVENT.POINTER_UP, endPointer);
      canvas.removeEventListener(EVENT.POINTER_CANCEL, endPointer);
      canvas.removeEventListener(EVENT.WHEEL, onWheel);
    };
  }, [graph, onSelect]);

  // Global scope keeps the same graph across note changes, so the mount effect
  // does not rerun; recenter on the newly opened note here instead.
  useEffect(() => {
    refitRef.current?.();
  }, [activePath]);

  useEffect(() => {
    drawRef.current?.();
  }, [palette, groupColors, showNodeGlow]);

  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    linkForceRef.current?.distance(forces.linkDistance).strength(forces.link);
    chargeForceRef.current?.strength(-forces.repel);
    xForceRef.current?.strength(forces.center);
    yForceRef.current?.strength(forces.center);
    sim.alpha(CFG.ALPHA_FORCE_UPDATE).restart();
  }, [forces.center, forces.repel, forces.link, forces.linkDistance]);

  const zoomButtons = zoomControls && [
    {
      label: zoomControls.zoomIn,
      Icon: ZoomIn,
      onClick: () => zoomByRef.current?.(CFG.ZOOM_STEP),
    },
    {
      label: zoomControls.zoomOut,
      Icon: ZoomOut,
      onClick: () => zoomByRef.current?.(1 / CFG.ZOOM_STEP),
    },
    {
      label: zoomControls.reset,
      Icon: Maximize,
      onClick: () => refitRef.current?.(),
    },
  ];

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="touch-none select-none" />
      {zoomButtons && (
        <div className="absolute bottom-2 right-2 flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {zoomButtons.map(({ label, Icon, onClick }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              className={ZOOM_BUTTON_CLASS}
              onClick={onClick}
            >
              <Icon className={ZOOM_ICON_CLASS} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
