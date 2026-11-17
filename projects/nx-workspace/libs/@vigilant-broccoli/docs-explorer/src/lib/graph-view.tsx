'use client';

import { useEffect, useRef } from 'react';
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
): string => {
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
  // The faint per-node glows; the open-note and hover highlights always draw.
  showNodeGlow?: boolean;
}

export function GraphView({
  graph,
  activePath,
  onSelect,
  forces = DEFAULT_FORCES,
  palette,
  showNodeGlow = true,
}: GraphViewProps) {
  const paletteRef = useRef(palette);
  paletteRef.current = palette;
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

    const draw = () => {
      const dark = isDarkTheme(container);
      const dpr = window.devicePixelRatio || 1;
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
        const color = nodeColor(n.group, dark, paletteRef.current);
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        addFadeStops(
          glow,
          color,
          nodeGlowAlpha * (isLit(n.id) ? 1 : COLOR.DIM_ALPHA),
        );
        ctx.fillStyle = glow;
        ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);
      }

      const drawGlow = (node: SimNode, scale: number, style: GlowStyle) => {
        const { sx, sy } = toScreen(node);
        const glowR =
          Math.max(
            CFG.ACTIVE_GLOW_RADIUS * transform.k,
            CFG.ACTIVE_GLOW_MIN_PX,
          ) * scale;
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        addFadeStops(
          glow,
          dark ? style.DARK : style.LIGHT,
          dark ? style.PEAK_DARK : style.PEAK_LIGHT,
        );
        ctx.fillStyle = glow;
        ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2);
      };
      const activeNode = activeId ? nodeById.get(activeId) : undefined;
      if (activeNode) drawGlow(activeNode, 1, ACTIVE_GLOW);
      const hoveredNode =
        hoveredId != null && hoveredId !== activeId
          ? nodeById.get(hoveredId)
          : undefined;
      if (hoveredNode) drawGlow(hoveredNode, CFG.HOVER_GLOW_SCALE, HOVER_GLOW);

      for (const link of links) {
        const s = nodeById.get(endpointId(link.source));
        const t = nodeById.get(endpointId(link.target));
        if (!s || !t) continue;
        ctx.lineWidth = linkWidth(link.value);
        const touchesFocus =
          focusId != null && (s.id === focusId || t.id === focusId);
        if (dimming && !touchesFocus) {
          ctx.globalAlpha = COLOR.DIM_ALPHA;
          ctx.strokeStyle = dark ? COLOR.LINK_DARK : COLOR.LINK_LIGHT;
        } else {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = touchesFocus
            ? COLOR.LINK_HL
            : dark
              ? COLOR.LINK_DARK
              : COLOR.LINK_LIGHT;
        }
        const a = toScreen(s);
        const b = toScreen(t);
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
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
        ctx.fillStyle =
          n.id === active
            ? COLOR.ACCENT
            : nodeColor(n.group, dark, paletteRef.current);
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
        if (!userInteracted) fitToView();
        draw();
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
          draw();
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
        draw();
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
      }
      panning = false;
      pointerId = null;
      canvas.style.cursor = 'grab';
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      userInteracted = true;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const { wx, wy } = toWorld(px, py);
      const factor = e.deltaY < 0 ? CFG.ZOOM_STEP : 1 / CFG.ZOOM_STEP;
      transform.k = Math.min(
        CFG.MAX_ZOOM,
        Math.max(CFG.MIN_ZOOM, transform.k * factor),
      );
      transform.x = px - wx * transform.k;
      transform.y = py - wy * transform.k;
      draw();
    };

    canvas.addEventListener(EVENT.POINTER_DOWN, onPointerDown);
    canvas.addEventListener(EVENT.POINTER_MOVE, onPointerMove);
    canvas.addEventListener(EVENT.POINTER_UP, endPointer);
    canvas.addEventListener(EVENT.POINTER_CANCEL, endPointer);
    canvas.addEventListener(EVENT.WHEEL, onWheel, { passive: false });

    const themeObserver = new MutationObserver(draw);
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
    media?.addEventListener(EVENT.CHANGE, draw);

    return () => {
      if (growFrame != null) cancelAnimationFrame(growFrame);
      refitRef.current = null;
      drawRef.current = null;
      sim.stop();
      simRef.current = null;
      resizeObserver.disconnect();
      themeObserver.disconnect();
      media?.removeEventListener(EVENT.CHANGE, draw);
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
  }, [palette, showNodeGlow]);

  useEffect(() => {
    const sim = simRef.current;
    if (!sim) return;
    linkForceRef.current?.distance(forces.linkDistance).strength(forces.link);
    chargeForceRef.current?.strength(-forces.repel);
    xForceRef.current?.strength(forces.center);
    yForceRef.current?.strength(forces.center);
    sim.alpha(CFG.ALPHA_FORCE_UPDATE).restart();
  }, [forces.center, forces.repel, forces.link, forces.linkDistance]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="touch-none select-none" />
    </div>
  );
}
