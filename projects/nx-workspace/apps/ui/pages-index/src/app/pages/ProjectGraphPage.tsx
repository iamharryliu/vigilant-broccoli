import {
  KeyboardEvent,
  PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  SimulationNodeDatum,
} from 'd3-force';
import { Maximize, X, ZoomIn, ZoomOut } from 'lucide-react';
import { SegmentedControl } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { FULL_HEIGHT_PAGE_CLASS } from '../consts/layout';
import { useAppearance } from '../theme';
import {
  Adjacency,
  buildAdjacency,
  getNeighbors,
  getVisibleProjects,
  GRAPH_PALETTE,
  GraphDependency,
  GraphProject,
  PROJECT_GRAPH_URL,
  PROJECT_TYPE,
  PROJECT_TYPE_LABEL_KEY,
  ProjectGraphData,
  ProjectType,
  toShortName,
  TYPE_FILTER,
  TYPE_FILTER_OPTIONS,
  TypeFilter,
} from '../consts/projectGraph';

const PARAM = {
  PROJECT: 'project',
  TYPE: 'type',
  SEARCH: 'q',
} as const;
type Param = (typeof PARAM)[keyof typeof PARAM];

const TYPE_FILTER_VALUES = Object.values(TYPE_FILTER);

const isTypeFilter = (value: string | null): value is TypeFilter =>
  value !== null && (TYPE_FILTER_VALUES as string[]).includes(value);

// Defaults are omitted from the hash query so the plain route stays clean.
function useGraphParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get(PARAM.TYPE);

  const update = (changes: Partial<Record<Param, string | null>>) =>
    setSearchParams(
      previous => {
        const next = new URLSearchParams(previous);
        Object.entries(changes).forEach(([param, value]) =>
          value ? next.set(param, value) : next.delete(param),
        );
        return next;
      },
      { replace: true },
    );

  return {
    selected: searchParams.get(PARAM.PROJECT),
    typeFilter: isTypeFilter(typeParam) ? typeParam : TYPE_FILTER.ALL,
    search: searchParams.get(PARAM.SEARCH) ?? '',
    update,
  };
}

const APP_RADIUS = 9;
const LIB_HALF_SIZE = 7;
const NODE_SIZE: Record<ProjectType, number> = {
  [PROJECT_TYPE.APP]: APP_RADIUS,
  [PROJECT_TYPE.LIB]: LIB_HALF_SIZE,
};
const LABEL_OFFSET = 4;
const LABEL_FONT_SIZE = 11;
const ARROW_GAP = 3;
const LAYOUT_TICKS = 300;
const LINK_DISTANCE = 80;
const CHARGE_STRENGTH = -300;
// Caps repulsion so isolated projects are not pushed far out, which would
// shrink the fitted graph.
const CHARGE_DISTANCE_MAX = 300;
const COLLIDE_RADIUS = 36;
// Apps settle above libs so dependency arrows mostly point downward.
const TYPE_BAND_OFFSET = 200;
const TYPE_BAND_STRENGTH = 0.12;
const CENTER_STRENGTH = 0.06;
// Room for labels, which extend to the right of each node.
const VIEW_PADDING = { LEFT: 16, RIGHT: 120, Y: 16 };
const DIMMED_OPACITY = 0.18;
const ZOOM = { MIN: 0.3, MAX: 6, STEP: 1.25, WHEEL_SENSITIVITY: 0.0015 };
const KEY_PAN_STEP = 40;
const CLICK_MOVE_TOLERANCE = 4;
const MARKER_ID = {
  DEFAULT: 'project-graph-arrow',
  ACTIVE: 'project-graph-arrow-active',
};
const ICON_CLASS = 'h-4 w-4 shrink-0';
const EMPTY_LIST: string[] = [];

interface LayoutNode extends SimulationNodeDatum {
  id: string;
  type: ProjectType;
}

interface Point {
  x: number;
  y: number;
}

interface LayoutPoint extends Point {
  type: ProjectType;
}

interface DragStart extends Point {
  project: string | null;
}

interface GraphLayout {
  positions: Map<string, LayoutPoint>;
  edges: GraphDependency[];
  viewBox: { x: number; y: number; width: number; height: number };
}

const computeLayout = (
  projects: GraphProject[],
  dependencies: GraphDependency[],
): GraphLayout => {
  const ids = new Set(projects.map(project => project.name));
  const edges = dependencies.filter(
    ({ source, target }) => ids.has(source) && ids.has(target),
  );
  const nodes: LayoutNode[] = projects.map(project => ({
    id: project.name,
    type: project.type,
  }));

  forceSimulation(nodes)
    .force(
      'link',
      forceLink<LayoutNode, { source: string; target: string }>(
        edges.map(edge => ({ ...edge })),
      )
        .id(node => node.id)
        .distance(LINK_DISTANCE),
    )
    .force(
      'charge',
      forceManyBody()
        .strength(CHARGE_STRENGTH)
        .distanceMax(CHARGE_DISTANCE_MAX),
    )
    .force('collide', forceCollide(COLLIDE_RADIUS))
    .force(
      'band',
      forceY<LayoutNode>(node =>
        node.type === PROJECT_TYPE.APP ? -TYPE_BAND_OFFSET : TYPE_BAND_OFFSET,
      ).strength(TYPE_BAND_STRENGTH),
    )
    .force('center', forceX(0).strength(CENTER_STRENGTH))
    .stop()
    .tick(LAYOUT_TICKS);

  const positions = new Map(
    nodes.map(node => [
      node.id,
      { x: node.x ?? 0, y: node.y ?? 0, type: node.type },
    ]),
  );
  const xs = nodes.map(node => node.x ?? 0);
  const ys = nodes.map(node => node.y ?? 0);
  const minX = Math.min(0, ...xs) - VIEW_PADDING.LEFT;
  const minY = Math.min(0, ...ys) - VIEW_PADDING.Y;
  const maxX = Math.max(0, ...xs) + VIEW_PADDING.RIGHT;
  const maxY = Math.max(0, ...ys) + VIEW_PADDING.Y;

  return {
    positions,
    edges,
    viewBox: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
  };
};

interface Transform {
  x: number;
  y: number;
  k: number;
}

const IDENTITY: Transform = { x: 0, y: 0, k: 1 };

const clampZoom = (k: number) => Math.min(ZOOM.MAX, Math.max(ZOOM.MIN, k));

// Scales around `focus` (viewBox coordinates) so that point stays in place.
const zoomAround = (transform: Transform, factor: number, focus: Point) => {
  const k = clampZoom(transform.k * factor);
  const ratio = k / transform.k;
  return {
    k,
    x: focus.x - (focus.x - transform.x) * ratio,
    y: focus.y - (focus.y - transform.y) * ratio,
  };
};

const toViewBoxPoint = (
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
) => {
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const point = new DOMPoint(clientX, clientY).matrixTransform(
    matrix.inverse(),
  );
  return { x: point.x, y: point.y };
};

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

const KEY_ACTIONS: Record<
  string,
  (transform: Transform, center: Point) => Transform
> = {
  ArrowLeft: t => ({ ...t, x: t.x + KEY_PAN_STEP }),
  ArrowRight: t => ({ ...t, x: t.x - KEY_PAN_STEP }),
  ArrowUp: t => ({ ...t, y: t.y + KEY_PAN_STEP }),
  ArrowDown: t => ({ ...t, y: t.y - KEY_PAN_STEP }),
  '+': (t, center) => zoomAround(t, ZOOM.STEP, center),
  '=': (t, center) => zoomAround(t, ZOOM.STEP, center),
  '-': (t, center) => zoomAround(t, 1 / ZOOM.STEP, center),
  '0': () => IDENTITY,
};

const ZOOM_BUTTON_CLASS =
  'flex h-9 w-9 items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-sky-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100';

interface GraphCanvasProps {
  projects: GraphProject[];
  dependencies: GraphDependency[];
  adjacency: Adjacency;
  selected: string | null;
  onSelect: (name: string | null) => void;
}

function GraphCanvas({
  projects,
  dependencies,
  adjacency,
  selected,
  onSelect,
}: GraphCanvasProps) {
  const { t } = useTranslation();
  const palette = GRAPH_PALETTE[useAppearance()];
  const svgRef = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const dragStart = useRef<DragStart | null>(null);
  const [transform, setTransform] = useState<Transform>(IDENTITY);
  const [hovered, setHovered] = useState<string | null>(null);

  const layout = useMemo(
    () => computeLayout(projects, dependencies),
    [projects, dependencies],
  );
  const { viewBox } = layout;
  const center = {
    x: viewBox.x + viewBox.width / 2,
    y: viewBox.y + viewBox.height / 2,
  };

  useEffect(() => setTransform(IDENTITY), [layout]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    // React registers wheel listeners as passive, so preventDefault needs a native one.
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const focus = toViewBoxPoint(svg, event.clientX, event.clientY);
      setTransform(current =>
        zoomAround(
          current,
          Math.exp(-event.deltaY * ZOOM.WHEEL_SENSITIVITY),
          focus,
        ),
      );
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  const active =
    hovered ?? (selected && layout.positions.has(selected) ? selected : null);
  const related = useMemo(
    () =>
      active ? new Set([active, ...getNeighbors(adjacency, active)]) : null,
    [active, adjacency],
  );

  // Pointer capture retargets later events to the svg, so the pressed node is
  // read here rather than on pointerup.
  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    const project =
      (event.target as Element)
        .closest('[data-project]')
        ?.getAttribute('data-project') ?? null;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    dragStart.current = { x: event.clientX, y: event.clientY, project };
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const svg = event.currentTarget;
    const nextPoint = { x: event.clientX, y: event.clientY };
    const others = [...pointers.current.entries()].filter(
      ([id]) => id !== event.pointerId,
    );
    pointers.current.set(event.pointerId, nextPoint);

    if (others.length === 1) {
      const [, other] = others[0];
      const previousSpan = distance(previous, other);
      if (previousSpan === 0) return;
      const mid = midpoint(nextPoint, other);
      setTransform(current =>
        zoomAround(
          current,
          distance(nextPoint, other) / previousSpan,
          toViewBoxPoint(svg, mid.x, mid.y),
        ),
      );
      return;
    }

    const from = toViewBoxPoint(svg, previous.x, previous.y);
    const to = toViewBoxPoint(svg, nextPoint.x, nextPoint.y);
    setTransform(current => ({
      ...current,
      x: current.x + to.x - from.x,
      y: current.y + to.y - from.y,
    }));
  };

  const onPointerUp = (event: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    const start = dragStart.current;
    const isClick =
      start &&
      pointers.current.size === 0 &&
      distance(start, { x: event.clientX, y: event.clientY }) <=
        CLICK_MOVE_TOLERANCE;
    if (!isClick) return;
    onSelect(
      start.project && start.project !== selected ? start.project : null,
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const action = KEY_ACTIONS[event.key];
    if (!action) return;
    event.preventDefault();
    setTransform(current => action(current, center));
  };

  const onNodeKeyDown = (event: KeyboardEvent<SVGGElement>, name: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(name === selected ? null : name);
  };

  const zoomBy = (factor: number) =>
    setTransform(current => zoomAround(current, factor, center));

  return (
    <div
      role="group"
      aria-label={t('PROJECT_GRAPH_PAGE.GRAPH_LABEL')}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="relative min-h-64 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white focus-visible:outline-2 focus-visible:outline-sky-500 dark:border-gray-700 dark:bg-gray-800"
    >
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={event => pointers.current.delete(event.pointerId)}
      >
        <defs>
          {[
            { id: MARKER_ID.DEFAULT, color: palette.edge },
            { id: MARKER_ID.ACTIVE, color: palette.edgeActive },
          ].map(marker => (
            <marker
              key={marker.id}
              id={marker.id}
              viewBox="0 0 10 10"
              refX={10}
              refY={5}
              markerWidth={6}
              markerHeight={6}
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={marker.color} />
            </marker>
          ))}
        </defs>
        <g
          transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
        >
          {layout.edges.map(({ source, target }) => {
            const from = layout.positions.get(source);
            const to = layout.positions.get(target);
            if (!from || !to) return null;
            const length = distance(from, to) || 1;
            const inset = NODE_SIZE[to.type] + ARROW_GAP;
            const isActive = active === source || active === target;
            return (
              <line
                key={`${source}->${target}`}
                x1={from.x}
                y1={from.y}
                x2={to.x - ((to.x - from.x) / length) * inset}
                y2={to.y - ((to.y - from.y) / length) * inset}
                stroke={isActive ? palette.edgeActive : palette.edge}
                strokeWidth={isActive ? 1.5 : 1}
                markerEnd={`url(#${isActive ? MARKER_ID.ACTIVE : MARKER_ID.DEFAULT})`}
                opacity={active && !isActive ? DIMMED_OPACITY : 1}
              />
            );
          })}
          {projects.map(project => {
            const position = layout.positions.get(project.name);
            if (!position) return null;
            const isSelected = project.name === selected;
            const size = NODE_SIZE[project.type];
            const fill =
              project.type === PROJECT_TYPE.APP ? palette.app : palette.lib;
            const ring = isSelected
              ? { stroke: palette.selectedRing, strokeWidth: 2.5 }
              : {};
            return (
              <g
                key={project.name}
                data-project={project.name}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={t('PROJECT_GRAPH_PAGE.NODE_LABEL', {
                  name: project.name,
                  type: t(PROJECT_TYPE_LABEL_KEY[project.type]),
                })}
                transform={`translate(${position.x} ${position.y})`}
                opacity={
                  related && !related.has(project.name) ? DIMMED_OPACITY : 1
                }
                className="cursor-pointer outline-none [&:focus-visible>.node-shape]:stroke-sky-500 [&:focus-visible>.node-shape]:[stroke-width:3px]"
                onPointerEnter={() => setHovered(project.name)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(project.name)}
                onBlur={() => setHovered(null)}
                onKeyDown={event => onNodeKeyDown(event, project.name)}
              >
                {project.type === PROJECT_TYPE.APP ? (
                  <circle
                    className="node-shape"
                    r={size}
                    fill={fill}
                    {...ring}
                  />
                ) : (
                  <rect
                    className="node-shape"
                    x={-size}
                    y={-size}
                    width={size * 2}
                    height={size * 2}
                    rx={2}
                    fill={fill}
                    {...ring}
                  />
                )}
                <text
                  x={size + LABEL_OFFSET}
                  dy="0.35em"
                  fontSize={LABEL_FONT_SIZE}
                  fontWeight={isSelected ? 600 : 400}
                  fill={palette.label}
                  stroke={palette.labelHalo}
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {toShortName(project.name)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="absolute bottom-2 right-2 flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <button
          type="button"
          aria-label={t('PROJECT_GRAPH_PAGE.ZOOM_IN')}
          title={t('PROJECT_GRAPH_PAGE.ZOOM_IN')}
          className={ZOOM_BUTTON_CLASS}
          onClick={() => zoomBy(ZOOM.STEP)}
        >
          <ZoomIn className={ICON_CLASS} />
        </button>
        <button
          type="button"
          aria-label={t('PROJECT_GRAPH_PAGE.ZOOM_OUT')}
          title={t('PROJECT_GRAPH_PAGE.ZOOM_OUT')}
          className={ZOOM_BUTTON_CLASS}
          onClick={() => zoomBy(1 / ZOOM.STEP)}
        >
          <ZoomOut className={ICON_CLASS} />
        </button>
        <button
          type="button"
          aria-label={t('PROJECT_GRAPH_PAGE.RESET_VIEW')}
          title={t('PROJECT_GRAPH_PAGE.RESET_VIEW')}
          className={ZOOM_BUTTON_CLASS}
          onClick={() => setTransform(IDENTITY)}
        >
          <Maximize className={ICON_CLASS} />
        </button>
      </div>
    </div>
  );
}

interface ProjectListProps {
  title: string;
  names: string[];
  onSelect: (name: string) => void;
}

function ProjectList({ title, names, onSelect }: ProjectListProps) {
  const { t } = useTranslation();
  return (
    <section className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title} ({names.length})
      </h3>
      {names.length === 0 ? (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('PROJECT_GRAPH_PAGE.NONE')}
        </p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {names.map(name => (
            <li key={name}>
              <button
                type="button"
                onClick={() => onSelect(name)}
                className="w-full truncate rounded px-1.5 py-1 text-left text-sm text-sky-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-sky-500 dark:text-sky-300 dark:hover:bg-gray-700"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

interface DetailPanelProps {
  project: GraphProject;
  adjacency: Adjacency;
  onSelect: (name: string) => void;
  onClose: () => void;
}

function DetailPanel({
  project,
  adjacency,
  onSelect,
  onClose,
}: DetailPanelProps) {
  const { t } = useTranslation();
  const sorted = (names: string[] | undefined) =>
    [...(names ?? EMPTY_LIST)].sort((a, b) => a.localeCompare(b));

  return (
    <aside className="max-h-[40%] shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:max-h-none md:w-72">
      <div className="flex items-start justify-between gap-2">
        <h2 className="break-all text-sm font-semibold">{project.name}</h2>
        <button
          type="button"
          aria-label={t('PROJECT_GRAPH_PAGE.CLOSE')}
          title={t('PROJECT_GRAPH_PAGE.CLOSE')}
          onClick={onClose}
          className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-sky-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          <X className={ICON_CLASS} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-700">
          {t(PROJECT_TYPE_LABEL_KEY[project.type])}
        </span>
        {project.tags.map(tag => (
          <span
            key={tag}
            className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <ProjectList
        title={t('PROJECT_GRAPH_PAGE.DEPENDS_ON')}
        names={sorted(adjacency.dependsOn.get(project.name))}
        onSelect={onSelect}
      />
      <ProjectList
        title={t('PROJECT_GRAPH_PAGE.DEPENDED_ON_BY')}
        names={sorted(adjacency.dependedOnBy.get(project.name))}
        onSelect={onSelect}
      />
    </aside>
  );
}

function Legend() {
  const { t } = useTranslation();
  const palette = GRAPH_PALETTE[useAppearance()];
  return (
    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
      <span className="flex items-center gap-1">
        <svg aria-hidden width={12} height={12} viewBox="-6 -6 12 12">
          <circle r={5} fill={palette.app} />
        </svg>
        {t('PROJECT_GRAPH_PAGE.TYPE_APP')}
      </span>
      <span className="flex items-center gap-1">
        <svg aria-hidden width={12} height={12} viewBox="-6 -6 12 12">
          <rect
            x={-4.5}
            y={-4.5}
            width={9}
            height={9}
            rx={1.5}
            fill={palette.lib}
          />
        </svg>
        {t('PROJECT_GRAPH_PAGE.TYPE_LIB')}
      </span>
    </div>
  );
}

export function ProjectGraphPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<ProjectGraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { selected, typeFilter, search, update } = useGraphParams();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(PROJECT_GRAPH_URL);
        if (!res.ok) {
          setError(t('PROJECT_GRAPH_PAGE.ERROR', { message: res.status }));
          return;
        }
        setData(await res.json());
      } catch (err) {
        setError(
          t('PROJECT_GRAPH_PAGE.ERROR', {
            message: err instanceof Error ? err.message : String(err),
          }),
        );
      }
    })();
  }, []);

  const adjacency = useMemo(
    () => buildAdjacency(data?.dependencies ?? []),
    [data],
  );
  const visibleProjects = useMemo(
    () => (data ? getVisibleProjects(data, adjacency, typeFilter, search) : []),
    [data, adjacency, typeFilter, search],
  );
  const selectedProject = data?.projects.find(
    project => project.name === selected,
  );

  // A project picked from the detail panel may be filtered out; clear the
  // filters so it is on the canvas.
  const selectFromPanel = (name: string) =>
    update(
      visibleProjects.some(project => project.name === name)
        ? { [PARAM.PROJECT]: name }
        : { [PARAM.PROJECT]: name, [PARAM.TYPE]: null, [PARAM.SEARCH]: null },
    );

  return (
    <main className={FULL_HEIGHT_PAGE_CLASS}>
      <PageHeader title={t('PROJECT_GRAPH_PAGE.TITLE')} />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {!error && !data && (
        <p className="text-sm text-muted-foreground">
          {t('PROJECT_GRAPH_PAGE.LOADING')}
        </p>
      )}

      {data && (
        <>
          <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={event =>
                update({ [PARAM.SEARCH]: event.target.value || null })
              }
              aria-label={t('PROJECT_GRAPH_PAGE.SEARCH_LABEL')}
              placeholder={t('PROJECT_GRAPH_PAGE.SEARCH_PLACEHOLDER')}
              className="h-9 min-w-0 flex-1 basis-48 rounded-md border border-gray-200 bg-white px-3 text-sm placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-sky-500 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-gray-500"
            />
            <SegmentedControl
              label={t('PROJECT_GRAPH_PAGE.FILTER_LABEL')}
              value={typeFilter}
              onChange={value =>
                update({
                  [PARAM.TYPE]: value === TYPE_FILTER.ALL ? null : value,
                })
              }
              options={TYPE_FILTER_OPTIONS.map(({ value, labelKey }) => ({
                value,
                label: t(labelKey),
              }))}
            />
          </div>
          <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
            <Legend />
            <p
              className="text-xs text-gray-500 dark:text-gray-400"
              aria-live="polite"
            >
              {t('PROJECT_GRAPH_PAGE.COUNT', {
                visible: visibleProjects.length,
                total: data.projects.length,
              })}
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row">
            {visibleProjects.length === 0 ? (
              <p className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                {t('PROJECT_GRAPH_PAGE.EMPTY')}
              </p>
            ) : (
              <GraphCanvas
                projects={visibleProjects}
                dependencies={data.dependencies}
                adjacency={adjacency}
                selected={selectedProject ? selectedProject.name : null}
                onSelect={name => update({ [PARAM.PROJECT]: name })}
              />
            )}
            {selectedProject && (
              <DetailPanel
                project={selectedProject}
                adjacency={adjacency}
                onSelect={selectFromPanel}
                onClose={() => update({ [PARAM.PROJECT]: null })}
              />
            )}
          </div>
        </>
      )}
    </main>
  );
}
