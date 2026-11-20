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

const ICON_CLASS = 'h-4 w-4 shrink-0';
const EMPTY_LIST: string[] = [];
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

interface GraphCanvasProps {
  projects: GraphProject[];
  dependencies: GraphDependency[];
  selected: string | null;
  onSelect: (name: string | null) => void;
  groupColors: GroupColors;
  settings: GraphSettings;
}

function GraphCanvas({
  projects,
  dependencies,
  selected,
  onSelect,
  groupColors,
  settings,
}: GraphCanvasProps) {
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
    <div
      role="group"
      aria-label={t('PROJECT_GRAPH_PAGE.GRAPH_LABEL')}
      className="relative min-h-64 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <GraphView
        graph={graph}
        activePath={selected ?? undefined}
        onSelect={handleSelect}
        groupColors={groupColors}
        forces={settings.appliedForces}
        showNodeGlow={settings.showNodeGlow}
        onBackgroundClick={clearSelection}
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
  const { selected, typeFilter, search, update } = useGraphParams();
  const settings = useGraphSettings(
    GRAPH_SETTINGS_STORAGE_PREFIX,
    HUES_SCHEME_ID,
  );
  const groupColors = useGroupColors(settings.colorScheme);

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
            <Legend colors={groupColors} />
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
                selected={selectedProject ? selectedProject.name : null}
                onSelect={name => update({ [PARAM.PROJECT]: name })}
                groupColors={groupColors}
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
