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

export interface GraphDependency {
  source: string;
  target: string;
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

export interface Adjacency {
  dependsOn: Map<string, string[]>;
  dependedOnBy: Map<string, string[]>;
}

const pushTo = (map: Map<string, string[]>, key: string, value: string) =>
  map.set(key, [...(map.get(key) ?? []), value]);

export const buildAdjacency = (dependencies: GraphDependency[]): Adjacency =>
  dependencies.reduce<Adjacency>(
    (adjacency, { source, target }) => {
      pushTo(adjacency.dependsOn, source, target);
      pushTo(adjacency.dependedOnBy, target, source);
      return adjacency;
    },
    { dependsOn: new Map(), dependedOnBy: new Map() },
  );

export const getNeighbors = (adjacency: Adjacency, name: string) => [
  ...(adjacency.dependsOn.get(name) ?? []),
  ...(adjacency.dependedOnBy.get(name) ?? []),
];

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
    edgeActive: '#0f172a',
    label: '#1f2937',
    labelHalo: '#ffffff',
    selectedRing: '#0f172a',
  },
  dark: {
    app: 'hsl(var(--pages-primary))',
    lib: '#c4b5fd',
    edge: 'hsl(217 15% 42%)',
    edgeActive: '#f8fafc',
    label: '#e5e7eb',
    labelHalo: '#1f2937',
    selectedRing: '#f8fafc',
  },
};
