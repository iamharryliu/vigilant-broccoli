import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEPENDENCY_GRAPH_ALL_GROUPS,
  DependencyGraph,
  type DependencyGraphDetailSection,
  type DependencyGraphEdgeKind,
  type DependencyGraphGroup,
  type DependencyGraphLabels,
  type DependencyGraphState,
} from '@vigilant-broccoli/docs-explorer';
import { useTranslation } from '../i18n';
import { PageHeader } from '../components/PageHeader';
import { FULL_HEIGHT_PAGE_CLASS } from '../consts/layout';
import { useAppearance } from '../theme';
import {
  DEPENDENCY_KIND,
  DEPENDENCY_KIND_LABEL_KEY,
  DEPENDENCY_KINDS,
  DependencyKind,
  getEdgeStyles,
  GRAPH_PALETTE,
  isDependencyKind,
  PROJECT_GRAPH_URL,
  PROJECT_TYPE,
  PROJECT_TYPE_LABEL_KEY,
  ProjectGraphData,
  toShortName,
  TYPE_FILTER,
  TYPE_FILTER_GROUP,
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
const serializeEdgeKinds = (kinds: ReadonlySet<string>) =>
  kinds.size === DEPENDENCY_KINDS.length
    ? null
    : DEPENDENCY_KINDS.filter(kind => kinds.has(kind)).join(EDGES_SEPARATOR);

const RUNTIME_KINDS = DEPENDENCY_KINDS.filter(
  kind => kind !== DEPENDENCY_KIND.LIB,
);

const GROUP_TYPE_FILTER = Object.fromEntries(
  Object.entries(TYPE_FILTER_GROUP).map(([filter, group]) => [group, filter]),
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

  const typeFilter = isTypeFilter(typeParam) ? typeParam : TYPE_FILTER.ALL;
  const state: DependencyGraphState = {
    selected: searchParams.get(PARAM.PROJECT),
    group: TYPE_FILTER_GROUP[typeFilter] ?? DEPENDENCY_GRAPH_ALL_GROUPS,
    search: searchParams.get(PARAM.SEARCH) ?? '',
    edgeKinds,
  };

  const onStateChange = (changes: Partial<DependencyGraphState>) =>
    update({
      ...('selected' in changes && { [PARAM.PROJECT]: changes.selected }),
      ...(changes.group !== undefined && {
        [PARAM.TYPE]:
          changes.group === DEPENDENCY_GRAPH_ALL_GROUPS
            ? null
            : GROUP_TYPE_FILTER[changes.group],
      }),
      ...(changes.search !== undefined && {
        [PARAM.SEARCH]: changes.search || null,
      }),
      ...(changes.edgeKinds && {
        [PARAM.EDGES]: serializeEdgeKinds(changes.edgeKinds),
      }),
    });

  return { state, onStateChange };
}

const PRIMARY_VAR = '--pages-primary';
const GRAPH_SETTINGS_STORAGE_PREFIX = 'project-graph';

// Concrete fallback: GraphView's glows add alpha to the color, so an
// unresolved `hsl(var(...))` would make the canvas gradient throw.
const FALLBACK_APP_COLOR = '#0ea5e9';
const readPrimaryColor = () => {
  const primary = getComputedStyle(document.documentElement)
    .getPropertyValue(PRIMARY_VAR)
    .trim();
  return primary ? `hsl(${primary})` : FALLBACK_APP_COLOR;
};

// The canvas cannot resolve CSS variables, so the app color is read from the
// document once the theme class is applied.
function useAppColor() {
  const appearance = useAppearance();
  const [appColor, setAppColor] = useState(readPrimaryColor);

  useEffect(() => setAppColor(readPrimaryColor()), [appearance]);

  return appColor;
}

export function ProjectGraphPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<ProjectGraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state, onStateChange } = useGraphParams();
  const appearance = useAppearance();
  const appColor = useAppColor();

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

  const nodes = useMemo(
    () =>
      (data?.projects ?? []).map(project => ({
        id: project.name,
        label: toShortName(project.name),
        group: project.type,
        tags: project.tags,
      })),
    [data],
  );

  const groups = useMemo<DependencyGraphGroup[]>(
    () => [
      {
        id: PROJECT_TYPE.APP,
        label: t(PROJECT_TYPE_LABEL_KEY[PROJECT_TYPE.APP]),
        filterLabel: t('PROJECT_GRAPH_PAGE.FILTER_APPS'),
        color: appColor,
      },
      {
        id: PROJECT_TYPE.LIB,
        label: t(PROJECT_TYPE_LABEL_KEY[PROJECT_TYPE.LIB]),
        filterLabel: t('PROJECT_GRAPH_PAGE.FILTER_LIBS'),
        color: GRAPH_PALETTE[appearance].lib,
      },
    ],
    [appColor, appearance],
  );

  // Lib edges stay unstyled so the canvas default color and focus highlight
  // apply; only runtime kinds get their own color and dash.
  const edgeKinds = useMemo<DependencyGraphEdgeKind[]>(() => {
    const styles = getEdgeStyles(GRAPH_PALETTE[appearance]);
    return DEPENDENCY_KINDS.map(kind => ({
      id: kind,
      label: t(DEPENDENCY_KIND_LABEL_KEY[kind]),
      ...styles[kind],
      isDefaultStyle: kind === DEPENDENCY_KIND.LIB,
    }));
  }, [appearance]);

  const detailSections = useMemo<DependencyGraphDetailSection[]>(
    () => [
      {
        title: t('PROJECT_GRAPH_PAGE.DEPENDS_ON'),
        direction: 'dependsOn',
        kinds: [DEPENDENCY_KIND.LIB],
      },
      {
        title: t('PROJECT_GRAPH_PAGE.DEPENDED_ON_BY'),
        direction: 'dependedOnBy',
        kinds: [DEPENDENCY_KIND.LIB],
      },
      {
        title: t('PROJECT_GRAPH_PAGE.RUNTIME_DEPENDS_ON'),
        direction: 'dependsOn',
        kinds: RUNTIME_KINDS,
        groups: [PROJECT_TYPE.APP],
        showKind: true,
      },
      {
        title: t('PROJECT_GRAPH_PAGE.RUNTIME_DEPENDED_ON_BY'),
        direction: 'dependedOnBy',
        kinds: RUNTIME_KINDS,
        groups: [PROJECT_TYPE.APP],
        showKind: true,
      },
    ],
    [],
  );

  const labels = useMemo<DependencyGraphLabels>(
    () => ({
      searchLabel: t('PROJECT_GRAPH_PAGE.SEARCH_LABEL'),
      searchPlaceholder: t('PROJECT_GRAPH_PAGE.SEARCH_PLACEHOLDER'),
      groupFilterLabel: t('PROJECT_GRAPH_PAGE.FILTER_LABEL'),
      groupFilterAll: t('PROJECT_GRAPH_PAGE.FILTER_ALL'),
      edgeFilterLabel: t('PROJECT_GRAPH_PAGE.EDGE_FILTER_LABEL'),
      graphLabel: t('PROJECT_GRAPH_PAGE.GRAPH_LABEL'),
      zoomIn: t('PROJECT_GRAPH_PAGE.ZOOM_IN'),
      zoomOut: t('PROJECT_GRAPH_PAGE.ZOOM_OUT'),
      resetView: t('PROJECT_GRAPH_PAGE.RESET_VIEW'),
      closeDetails: t('PROJECT_GRAPH_PAGE.CLOSE'),
      none: t('PROJECT_GRAPH_PAGE.NONE'),
      empty: t('PROJECT_GRAPH_PAGE.EMPTY'),
      count: counts => t('PROJECT_GRAPH_PAGE.COUNT', counts),
    }),
    [],
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
        <DependencyGraph
          nodes={nodes}
          edges={data.dependencies}
          groups={groups}
          edgeKinds={edgeKinds}
          detailSections={detailSections}
          state={state}
          onStateChange={onStateChange}
          settingsStoragePrefix={GRAPH_SETTINGS_STORAGE_PREFIX}
          labels={labels}
        />
      )}
    </main>
  );
}
