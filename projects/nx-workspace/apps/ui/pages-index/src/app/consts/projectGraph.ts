import { DotPaths, ThemeAppearance } from '@vigilant-broccoli/react-lib';
import en from '../i18n/en.json';

type TranslationKey = DotPaths<typeof en>;

export const PROJECT_GRAPH_URL = `${import.meta.env.BASE_URL}project-graph.json`;

export const PROJECT_TYPE = {
  APP: 'app',
  LIB: 'lib',
} as const;
export type ProjectType = (typeof PROJECT_TYPE)[keyof typeof PROJECT_TYPE];

export const PROJECT_TYPE_LABEL_KEY: Record<ProjectType, TranslationKey> = {
  [PROJECT_TYPE.APP]: 'PROJECT_GRAPH_PAGE.TYPE_APP',
  [PROJECT_TYPE.LIB]: 'PROJECT_GRAPH_PAGE.TYPE_LIB',
};

export interface GraphProject {
  name: string;
  type: ProjectType;
  tags: string[];
}

// `lib` edges come from Nx; `embeds` (iframes) and `calls` (HTTP API) come
// from each app README's `## App Dependencies` section.
export const DEPENDENCY_KIND = {
  LIB: 'lib',
  EMBEDS: 'embeds',
  CALLS: 'calls',
} as const;
export type DependencyKind =
  (typeof DEPENDENCY_KIND)[keyof typeof DEPENDENCY_KIND];
export const DEPENDENCY_KINDS: DependencyKind[] =
  Object.values(DEPENDENCY_KIND);

export const DEPENDENCY_KIND_LABEL_KEY: Record<DependencyKind, TranslationKey> =
  {
    [DEPENDENCY_KIND.LIB]: 'PROJECT_GRAPH_PAGE.EDGE_LIB',
    [DEPENDENCY_KIND.EMBEDS]: 'PROJECT_GRAPH_PAGE.EDGE_EMBEDS',
    [DEPENDENCY_KIND.CALLS]: 'PROJECT_GRAPH_PAGE.EDGE_CALLS',
  };

export const isDependencyKind = (value: string): value is DependencyKind =>
  (DEPENDENCY_KINDS as string[]).includes(value);

export interface GraphDependency {
  source: string;
  target: string;
  kind: DependencyKind;
}

export interface ProjectGraphData {
  projects: GraphProject[];
  dependencies: GraphDependency[];
}

export const TYPE_FILTER = {
  ALL: 'all',
  APPS: 'apps',
  LIBS: 'libs',
} as const;
export type TypeFilter = (typeof TYPE_FILTER)[keyof typeof TYPE_FILTER];

export const TYPE_FILTER_OPTIONS: {
  value: TypeFilter;
  labelKey: TranslationKey;
}[] = [
  { value: TYPE_FILTER.ALL, labelKey: 'PROJECT_GRAPH_PAGE.FILTER_ALL' },
  { value: TYPE_FILTER.APPS, labelKey: 'PROJECT_GRAPH_PAGE.FILTER_APPS' },
  { value: TYPE_FILTER.LIBS, labelKey: 'PROJECT_GRAPH_PAGE.FILTER_LIBS' },
];

const TYPE_FILTER_MATCH: Record<TypeFilter, (type: ProjectType) => boolean> = {
  [TYPE_FILTER.ALL]: () => true,
  [TYPE_FILTER.APPS]: type => type === PROJECT_TYPE.APP,
  [TYPE_FILTER.LIBS]: type => type === PROJECT_TYPE.LIB,
};

const SCOPE_PREFIX = /^@[^/]+\//;
export const toShortName = (name: string) => name.replace(SCOPE_PREFIX, '');

export interface Neighbor {
  name: string;
  kind: DependencyKind;
}

export interface Adjacency {
  dependsOn: Map<string, Neighbor[]>;
  dependedOnBy: Map<string, Neighbor[]>;
}

const pushTo = (
  map: Map<string, Neighbor[]>,
  key: string,
  neighbor: Neighbor,
) => map.set(key, [...(map.get(key) ?? []), neighbor]);

export const buildAdjacency = (dependencies: GraphDependency[]): Adjacency =>
  dependencies.reduce<Adjacency>(
    (adjacency, { source, target, kind }) => {
      pushTo(adjacency.dependsOn, source, { name: target, kind });
      pushTo(adjacency.dependedOnBy, target, { name: source, kind });
      return adjacency;
    },
    { dependsOn: new Map(), dependedOnBy: new Map() },
  );

export const getNeighbors = (adjacency: Adjacency, name: string) =>
  [
    ...(adjacency.dependsOn.get(name) ?? []),
    ...(adjacency.dependedOnBy.get(name) ?? []),
  ].map(neighbor => neighbor.name);

export const filterDependencies = (
  dependencies: GraphDependency[],
  kinds: ReadonlySet<DependencyKind>,
) => dependencies.filter(({ kind }) => kinds.has(kind));

// Search keeps each match plus its direct neighbors so a project's
// dependencies stay visible while narrowing.
export const getVisibleProjects = (
  data: ProjectGraphData,
  adjacency: Adjacency,
  typeFilter: TypeFilter,
  search: string,
): GraphProject[] => {
  const byType = data.projects.filter(project =>
    TYPE_FILTER_MATCH[typeFilter](project.type),
  );
  const query = search.trim().toLowerCase();
  if (!query) return byType;
  const matches = byType.filter(project =>
    project.name.toLowerCase().includes(query),
  );
  const keep = new Set(
    matches.flatMap(project => [
      project.name,
      ...getNeighbors(adjacency, project.name),
    ]),
  );
  return byType.filter(project => keep.has(project.name));
};

interface GraphPalette {
  app: string;
  lib: string;
  edge: string;
  embedsEdge: string;
  callsEdge: string;
  edgeActive: string;
  label: string;
  labelHalo: string;
  selectedRing: string;
}

// Apps use the page primary; libs a contrasting hue tuned per appearance.
export const GRAPH_PALETTE: Record<ThemeAppearance, GraphPalette> = {
  light: {
    app: 'hsl(var(--pages-primary))',
    lib: '#7c3aed',
    edge: 'hsl(220 9% 70%)',
    embedsEdge: '#0d9488',
    callsEdge: '#ea580c',
    edgeActive: '#0f172a',
    label: '#1f2937',
    labelHalo: '#ffffff',
    selectedRing: '#0f172a',
  },
  dark: {
    app: 'hsl(var(--pages-primary))',
    lib: '#c4b5fd',
    edge: 'hsl(217 15% 42%)',
    embedsEdge: '#2dd4bf',
    callsEdge: '#fb923c',
    edgeActive: '#f8fafc',
    label: '#e5e7eb',
    labelHalo: '#1f2937',
    selectedRing: '#f8fafc',
  },
};

// Runtime edges are dashed (embeds) or dotted (calls) so they read apart from
// solid lib edges even when a scheme or dimming changes their color.
const EDGE_DASH: Record<DependencyKind, readonly number[]> = {
  [DEPENDENCY_KIND.LIB]: [],
  [DEPENDENCY_KIND.EMBEDS]: [6, 4],
  [DEPENDENCY_KIND.CALLS]: [2, 3],
};

export interface EdgeStyle {
  color: string;
  dash: readonly number[];
}

export const getEdgeStyles = (
  palette: GraphPalette,
): Record<DependencyKind, EdgeStyle> => ({
  [DEPENDENCY_KIND.LIB]: { color: palette.edge, dash: EDGE_DASH.lib },
  [DEPENDENCY_KIND.EMBEDS]: {
    color: palette.embedsEdge,
    dash: EDGE_DASH.embeds,
  },
  [DEPENDENCY_KIND.CALLS]: { color: palette.callsEdge, dash: EDGE_DASH.calls },
});
