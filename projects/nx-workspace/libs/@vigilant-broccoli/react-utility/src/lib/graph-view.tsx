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
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { NoteGraph } from '@vigilant-broccoli/react-lib';

interface SimNode extends SimulationNodeDatum {
  id: string;
  name: string;
  group: string;
  degree: number;
}

type SimLink = SimulationLinkDatum<SimNode>;

const CFG = {
  CHARGE: -160,
  LINK_DISTANCE: 40,
  COLLIDE_PAD: 4,
  GRAVITY: 0.05,
  NODE_MIN_R: 3,
  NODE_R_STEP: 1.4,
  HIT_PAD: 4,
  LINK_WIDTH: 1,
  LABEL_FONT_PX: 11,
  LABEL_ZOOM: 1.4,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 6,
  ZOOM_STEP: 1.15,
  FIT_PADDING: 40,
  DRAG_THRESHOLD_PX: 4,
  ALPHA_DRAG: 0.3,
} as const;

const COLOR = {
  ROOT_LIGHT: '#6b7280',
  ROOT_DARK: '#9ca3af',
  LINK_LIGHT: 'rgba(0,0,0,0.12)',
  LINK_DARK: 'rgba(255,255,255,0.14)',
  LINK_HL: 'rgba(59,130,246,0.75)',
  ACCENT: '#3b82f6',
  LABEL_LIGHT: '#374151',
  LABEL_DARK: '#d1d5db',
  DIM_ALPHA: 0.15,
} as const;

const DARK_CLASS = 'dark';
const LIGHT_CLASS = 'light';
const CLASS_ATTR = 'class';
const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

const EVENT = {
  POINTER_DOWN: 'pointerdown',
  POINTER_MOVE: 'pointermove',
  POINTER_UP: 'pointerup',
  POINTER_CANCEL: 'pointercancel',
  WHEEL: 'wheel',
  CHANGE: 'change',
} as const;

const isDarkTheme = (): boolean => {
  if (typeof document === 'undefined') return false;
  if (document.documentElement.classList.contains(DARK_CLASS)) return true;
  if (document.documentElement.classList.contains(LIGHT_CLASS)) return false;
  return window.matchMedia?.(PREFERS_DARK_QUERY).matches ?? false;
};

const groupHue = (group: string): number => {
  let hash = 0;
  for (let i = 0; i < group.length; i++)
    hash = (hash * 31 + group.charCodeAt(i)) >>> 0;
  return hash % 360;
};

const nodeColor = (group: string, dark: boolean): string => {
  if (!group) return dark ? COLOR.ROOT_DARK : COLOR.ROOT_LIGHT;
  return `hsl(${groupHue(group)} 65% ${dark ? 62 : 46}%)`;
};

const nodeRadius = (degree: number): number =>
  CFG.NODE_MIN_R + Math.sqrt(degree) * CFG.NODE_R_STEP;

const endpointId = (end: SimLink['source']): string =>
  typeof end === 'object' ? (end as SimNode).id : String(end);

export interface GraphViewProps {
  graph: NoteGraph;
  activePath?: string;
  onSelect: (path: string) => void;
}

export function GraphView({ graph, activePath, onSelect }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePathRef = useRef(activePath);
  activePathRef.current = activePath;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes: SimNode[] = graph.nodes.map(n => ({ ...n, degree: 0 }));
    const nodeById = new Map(nodes.map(n => [n.id, n]));
    const links: SimLink[] = [];
    const neighbors = new Map<string, Set<string>>();
    nodes.forEach(n => neighbors.set(n.id, new Set()));
    for (const link of graph.links) {
      const source = nodeById.get(link.source);
      const target = nodeById.get(link.target);
      if (!source || !target) continue;
      links.push({ source: source.id, target: target.id });
      source.degree++;
      target.degree++;
      neighbors.get(source.id)?.add(target.id);
      neighbors.get(target.id)?.add(source.id);
    }

    const transform = { k: 1, x: 0, y: 0 };
    let hoveredId: string | null = null;
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

    const fitToView = () => {
      if (nodes.length === 0) return;
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
      const spanX = maxX - minX || 1;
      const spanY = maxY - minY || 1;
      const k = Math.min(
        (width - CFG.FIT_PADDING * 2) / spanX,
        (height - CFG.FIT_PADDING * 2) / spanY,
        CFG.MAX_ZOOM,
      );
      transform.k = Math.max(k, CFG.MIN_ZOOM);
      transform.x = width / 2 - ((minX + maxX) / 2) * transform.k;
      transform.y = height / 2 - ((minY + maxY) / 2) * transform.k;
    };

    const draw = () => {
      const dark = isDarkTheme();
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const active = activePathRef.current;
      const focusId =
        hoveredId ?? (active && nodeById.has(active) ? active : null);
      const focusSet = focusId ? neighbors.get(focusId) : null;
      const isLit = (id: string) =>
        !focusId || id === focusId || (focusSet?.has(id) ?? false);

      ctx.lineWidth = CFG.LINK_WIDTH;
      for (const link of links) {
        const s = nodeById.get(endpointId(link.source));
        const t = nodeById.get(endpointId(link.target));
        if (!s || !t) continue;
        const touchesFocus =
          focusId != null && (s.id === focusId || t.id === focusId);
        if (focusId && !touchesFocus) {
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
        const r = nodeRadius(n.degree);
        const lit = isLit(n.id);
        ctx.globalAlpha = lit ? 1 : COLOR.DIM_ALPHA;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor(n.group, dark);
        ctx.fill();
        if (n.id === active) {
          ctx.globalAlpha = 1;
          ctx.lineWidth = 2;
          ctx.strokeStyle = COLOR.ACCENT;
          ctx.stroke();
          ctx.lineWidth = CFG.LINK_WIDTH;
        }
        const labelled =
          n.id === focusId || n.id === active || (showAllLabels && lit);
        if (labelled) {
          ctx.globalAlpha = lit ? 1 : COLOR.DIM_ALPHA;
          ctx.fillStyle = dark ? COLOR.LABEL_DARK : COLOR.LABEL_LIGHT;
          ctx.fillText(n.name, sx, sy + r + 2);
        }
      }
      ctx.globalAlpha = 1;
    };

    const sim: Simulation<SimNode, SimLink> = forceSimulation(nodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(links)
          .id(d => d.id)
          .distance(CFG.LINK_DISTANCE),
      )
      .force('charge', forceManyBody().strength(CFG.CHARGE))
      .force('center', forceCenter(0, 0))
      .force('x', forceX(0).strength(CFG.GRAVITY))
      .force('y', forceY(0).strength(CFG.GRAVITY))
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
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [CLASS_ATTR],
    });
    const media = window.matchMedia?.(PREFERS_DARK_QUERY);
    media?.addEventListener(EVENT.CHANGE, draw);

    return () => {
      sim.stop();
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

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="touch-none select-none" />
    </div>
  );
}
