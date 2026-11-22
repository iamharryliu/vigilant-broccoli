import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { SegmentedControl } from '@vigilant-broccoli/react-lib';
import {
  GRAPH_COLOR_SCHEMES,
  GraphSettingsFields,
  GraphSettingsMenu,
  GraphView,
  useGraphSettings,
  type GraphColorScheme,
  type GraphLinkStyle,
  type GraphSettings,
  type NoteGraph,
} from '@vigilant-broccoli/docs-explorer';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { FULL_HEIGHT_PAGE_CLASS } from '../consts/layout';
import { useAppearance } from '../theme';
import {
  Adjacency,
  buildAdjacency,
  DEPENDENCY_KIND,
  DEPENDENCY_KIND_LABEL_KEY,
  DEPENDENCY_KINDS,
  DependencyKind,
  EdgeStyle,
  filterDependencies,
  getEdgeStyles,
  getVisibleProjects,
  GRAPH_PALETTE,
  GraphDependency,
  GraphProject,
  isDependencyKind,
  Neighbor,
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
  EDGES: 'edges',
} as const;
type Param = (typeof PARAM)[keyof typeof PARAM];

const TYPE_FILTER_VALUES = Object.values(TYPE_FILTER);
const EDGES_SEPARATOR = ',';

const isTypeFilter = (value: string | null): value is TypeFilter =>
  value !== null && (TYPE_FILTER_VALUES as string[]).includes(value);

const parseEdgeKinds = (value: string | null): Set<DependencyKind> => {
  const kinds = (value ?? '').split(EDGES_SEPARATOR).filter(isDependencyKind);
  return new Set(kinds.length ? kinds : DEPENDENCY_KINDS);
};

// All kinds is the default, so it serializes to no param.
const serializeEdgeKinds = (kinds: ReadonlySet<DependencyKind>) =>
  kinds.size === DEPENDENCY_KINDS.length
    ? null
    : DEPENDENCY_KINDS.filter(kind => kinds.has(kind)).join(EDGES_SEPARATOR);

const RUNTIME_KINDS = DEPENDENCY_KINDS.filter(
  kind => kind !== DEPENDENCY_KIND.LIB,
);

// Defaults are omitted from the hash query so the plain route stays clean.
function useGraphParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = searchParams.get(PARAM.TYPE);
  const edgesParam = searchParams.get(PARAM.EDGES);
  const edgeKinds = useMemo(() => parseEdgeKinds(edgesParam), [edgesParam]);

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
    edgeKinds,
    update,
  };
}

const ICON_CLASS = 'h-4 w-4 shrink-0';
const EMPTY_LIST: Neighbor[] = [];
const PRIMARY_VAR = '--pages-primary';
const GRAPH_SETTINGS_STORAGE_PREFIX = 'project-graph';
// The page's own app/lib colors are the default; docs graphs default to a
// Wada palette instead.
const HUES_SCHEME_ID = GRAPH_COLOR_SCHEMES.find(
  scheme => scheme.colors === null,
)?.id;

type GroupColors = Record<ProjectType, string>;

// Concrete fallback: GraphView's glows add alpha to the color, so an
// unresolved `hsl(var(...))` would make the canvas gradient throw.
const FALLBACK_APP_COLOR = '#0ea5e9';
const readPrimaryColor = () => {
  const primary = getComputedStyle(document.documentElement)
    .getPropertyValue(PRIMARY_VAR)
    .trim();
  return primary ? `hsl(${primary})` : FALLBACK_APP_COLOR;
};

// GraphView draws on a canvas, which cannot resolve CSS variables, so the app
// color is read from the document once the theme class is applied. A chosen
// scheme assigns its first two colors to apps and libs by position: palettes
// are picked by name hash, and `app` and `lib` hash to the same slot.
function useGroupColors(colorScheme: GraphColorScheme): GroupColors {
  const appearance = useAppearance();
  const palette = GRAPH_PALETTE[appearance];
  const [appColor, setAppColor] = useState(readPrimaryColor);

  useEffect(() => setAppColor(readPrimaryColor()), [appearance]);

  return useMemo(() => {
    const [schemeApp, schemeLib] = colorScheme.colors ?? [];
    return {
      [PROJECT_TYPE.APP]: schemeApp ?? appColor,
      [PROJECT_TYPE.LIB]: schemeLib ?? palette.lib,
    };
  }, [colorScheme, appColor, palette.lib]);
}

function useEdgeStyles(): Record<DependencyKind, EdgeStyle> {
  const appearance = useAppearance();
  return useMemo(() => getEdgeStyles(GRAPH_PALETTE[appearance]), [appearance]);
}

// Lib edges stay unstyled so GraphView's default color and focus highlight
// apply; only runtime kinds get their own color and dash.
const toLinkStyles = (
  edgeStyles: Record<DependencyKind, EdgeStyle>,
): Record<string, GraphLinkStyle> =>
  Object.fromEntries(RUNTIME_KINDS.map(kind => [kind, edgeStyles[kind]]));

interface GraphCanvasProps {
  projects: GraphProject[];
  dependencies: GraphDependency[];
  selected: string | null;
  onSelect: (name: string | null) => void;
  groupColors: GroupColors;
  edgeStyles: Record<DependencyKind, EdgeStyle>;
  settings: GraphSettings;
}

function GraphCanvas({
  projects,
  dependencies,
  selected,
  onSelect,
  groupColors,
  edgeStyles,
  settings,
}: GraphCanvasProps) {
  const linkStyles = useMemo(() => toLinkStyles(edgeStyles), [edgeStyles]);
  const { t } = useTranslation();

  const graph = useMemo<NoteGraph>(() => {
    const visible = new Set(projects.map(project => project.name));
    return {
      nodes: projects.map(project => ({
        id: project.name,
        name: toShortName(project.name),
        group: project.type,
      })),
      links: dependencies.filter(
        ({ source, target }) => visible.has(source) && visible.has(target),
      ),
    };
  }, [projects, dependencies]);

  // GraphView rebuilds its simulation when onSelect changes, so the callback
  // stays stable and reads the current selection from a ref.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const handleSelect = useCallback(
    (name: string) =>
      onSelectRef.current(name === selectedRef.current ? null : name),
    [],
  );
  const clearSelection = useCallback(() => {
    if (selectedRef.current !== null) onSelectRef.current(null);
  }, []);

  return (
    <div className="relative min-h-64 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <GraphView
        graph={graph}
        activePath={selected ?? undefined}
        onSelect={handleSelect}
        groupColors={groupColors}
        forces={settings.appliedForces}
        showNodeGlow={settings.showNodeGlow}
        onBackgroundClick={clearSelection}
        directed
        linkStyles={linkStyles}
        keyboardLabel={t('PROJECT_GRAPH_PAGE.GRAPH_LABEL')}
        zoomControls={{
          zoomIn: t('PROJECT_GRAPH_PAGE.ZOOM_IN'),
          zoomOut: t('PROJECT_GRAPH_PAGE.ZOOM_OUT'),
          reset: t('PROJECT_GRAPH_PAGE.RESET_VIEW'),
        }}
      />
      <div className="absolute right-2 top-2 z-10">
        <GraphSettingsMenu>
          <GraphSettingsFields settings={settings} />
        </GraphSettingsMenu>
      </div>
    </div>
  );
}

interface ProjectListProps {
  title: string;
  neighbors: Neighbor[];
  showKind?: boolean;
  onSelect: (name: string) => void;
}

function ProjectList({
  title,
  neighbors,
  showKind = false,
  onSelect,
}: ProjectListProps) {
  const { t } = useTranslation();
  return (
    <section className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title} ({neighbors.length})
      </h3>
      {neighbors.length === 0 ? (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t('PROJECT_GRAPH_PAGE.NONE')}
        </p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {neighbors.map(({ name, kind }) => (
            <li key={`${name}|${kind}`}>
              <button
                type="button"
                onClick={() => onSelect(name)}
                className="flex w-full items-center justify-between gap-2 rounded px-1.5 py-1 text-left text-sm text-sky-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-sky-500 dark:text-sky-300 dark:hover:bg-gray-700"
              >
                <span className="truncate">{name}</span>
                {showKind && (
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {t(DEPENDENCY_KIND_LABEL_KEY[kind])}
                  </span>
                )}
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
  const split = (neighbors: Neighbor[] | undefined) => {
    const sorted = [...(neighbors ?? EMPTY_LIST)].sort(
      (a, b) => a.name.localeCompare(b.name) || a.kind.localeCompare(b.kind),
    );
    return {
      lib: sorted.filter(({ kind }) => kind === DEPENDENCY_KIND.LIB),
      runtime: sorted.filter(({ kind }) => kind !== DEPENDENCY_KIND.LIB),
    };
  };
  const dependsOn = split(adjacency.dependsOn.get(project.name));
  const dependedOnBy = split(adjacency.dependedOnBy.get(project.name));

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
        neighbors={dependsOn.lib}
        onSelect={onSelect}
      />
      <ProjectList
        title={t('PROJECT_GRAPH_PAGE.DEPENDED_ON_BY')}
        neighbors={dependedOnBy.lib}
        onSelect={onSelect}
      />
      {project.type === PROJECT_TYPE.APP && (
        <>
          <ProjectList
            title={t('PROJECT_GRAPH_PAGE.RUNTIME_DEPENDS_ON')}
            neighbors={dependsOn.runtime}
            showKind
            onSelect={onSelect}
          />
          <ProjectList
            title={t('PROJECT_GRAPH_PAGE.RUNTIME_DEPENDED_ON_BY')}
            neighbors={dependedOnBy.runtime}
            showKind
            onSelect={onSelect}
          />
        </>
      )}
    </aside>
  );
}

const EDGE_SWATCH_WIDTH = 18;

interface EdgeKindTogglesProps {
  edgeKinds: ReadonlySet<DependencyKind>;
  edgeStyles: Record<DependencyKind, EdgeStyle>;
  onChange: (kinds: Set<DependencyKind>) => void;
}

// Doubles as the edge legend: each toggle shows its kind's line style. The
// last enabled kind cannot be turned off, so the graph never loses all edges.
function EdgeKindToggles({
  edgeKinds,
  edgeStyles,
  onChange,
}: EdgeKindTogglesProps) {
  const { t } = useTranslation();
  const toggle = (kind: DependencyKind) => {
    const next = new Set(edgeKinds);
    if (next.has(kind)) next.delete(kind);
    else next.add(kind);
    if (next.size) onChange(next);
  };

  return (
    <div
      role="group"
      aria-label={t('PROJECT_GRAPH_PAGE.EDGE_FILTER_LABEL')}
      className="flex flex-wrap items-center gap-1"
    >
      {DEPENDENCY_KINDS.map(kind => {
        const { color, dash } = edgeStyles[kind];
        const pressed = edgeKinds.has(kind);
        return (
          <button
            key={kind}
            type="button"
            aria-pressed={pressed}
            onClick={() => toggle(kind)}
            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs focus-visible:outline-2 focus-visible:outline-sky-500 ${
              pressed
                ? 'border-gray-300 bg-gray-100 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'
                : 'border-gray-200 text-gray-400 line-through dark:border-gray-700 dark:text-gray-500'
            }`}
          >
            <svg
              aria-hidden
              width={EDGE_SWATCH_WIDTH}
              height={6}
              viewBox={`0 0 ${EDGE_SWATCH_WIDTH} 6`}
            >
              <line
                x1={0}
                y1={3}
                x2={EDGE_SWATCH_WIDTH}
                y2={3}
                stroke={color}
                strokeWidth={2}
                strokeDasharray={dash.join(' ') || undefined}
              />
            </svg>
            {t(DEPENDENCY_KIND_LABEL_KEY[kind])}
          </button>
        );
      })}
    </div>
  );
}

function Legend({ colors }: { colors: GroupColors }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
      <span className="flex items-center gap-1">
        <svg aria-hidden width={12} height={12} viewBox="-6 -6 12 12">
          <circle r={5} fill={colors[PROJECT_TYPE.APP]} />
        </svg>
        {t('PROJECT_GRAPH_PAGE.TYPE_APP')}
      </span>
      <span className="flex items-center gap-1">
        <svg aria-hidden width={12} height={12} viewBox="-6 -6 12 12">
          <circle r={5} fill={colors[PROJECT_TYPE.LIB]} />
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
  const { selected, typeFilter, search, edgeKinds, update } = useGraphParams();
  const settings = useGraphSettings(
    GRAPH_SETTINGS_STORAGE_PREFIX,
    HUES_SCHEME_ID,
  );
  const groupColors = useGroupColors(settings.colorScheme);
  const edgeStyles = useEdgeStyles();

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

  // The detail panel lists every kind; the canvas and search neighbors follow
  // the edge-kind toggles.
  const adjacency = useMemo(
    () => buildAdjacency(data?.dependencies ?? []),
    [data],
  );
  const shownDependencies = useMemo(
    () => filterDependencies(data?.dependencies ?? [], edgeKinds),
    [data, edgeKinds],
  );
  const shownAdjacency = useMemo(
    () => buildAdjacency(shownDependencies),
    [shownDependencies],
  );
  const visibleProjects = useMemo(
    () =>
      data ? getVisibleProjects(data, shownAdjacency, typeFilter, search) : [],
    [data, shownAdjacency, typeFilter, search],
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
            <div className="flex flex-wrap items-center gap-3">
              <Legend colors={groupColors} />
              <EdgeKindToggles
                edgeKinds={edgeKinds}
                edgeStyles={edgeStyles}
                onChange={kinds =>
                  update({ [PARAM.EDGES]: serializeEdgeKinds(kinds) })
                }
              />
            </div>
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
                dependencies={shownDependencies}
                selected={selectedProject ? selectedProject.name : null}
                onSelect={name => update({ [PARAM.PROJECT]: name })}
                groupColors={groupColors}
                edgeStyles={edgeStyles}
                settings={settings}
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
