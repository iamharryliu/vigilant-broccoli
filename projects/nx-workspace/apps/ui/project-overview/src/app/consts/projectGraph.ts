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

// The URL keeps `apps`/`libs`; the shared graph filters by group id.
export const TYPE_FILTER_GROUP: Record<TypeFilter, ProjectType | null> = {
  [TYPE_FILTER.ALL]: null,
  [TYPE_FILTER.APPS]: PROJECT_TYPE.APP,
  [TYPE_FILTER.LIBS]: PROJECT_TYPE.LIB,
};

const SCOPE_PREFIX = /^@[^/]+\//;
export const toShortName = (name: string) => name.replace(SCOPE_PREFIX, '');

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
