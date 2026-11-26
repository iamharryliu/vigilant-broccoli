import { useMemo, useState } from 'react';
import {
  DEPENDENCY_GRAPH_ALL_GROUPS,
  DependencyGraph,
  type DependencyGraphDetailSection,
  type DependencyGraphEdge,
  type DependencyGraphEdgeKind,
  type DependencyGraphGroup,
  type DependencyGraphLabels,
  type DependencyGraphNode,
  type DependencyGraphState,
} from '@vigilant-broccoli/docs-explorer';
import { DEPENDS_ON } from '../depends-on';

const EDGE_KIND = { DEPENDS_ON: 'depends-on' } as const;
const SETTINGS_STORAGE_PREFIX = 'component-graph';
const OPEN_LABEL = 'Open component';

// Mid-tone hues that stay legible on both the light and dark canvas.
const GROUP_COLORS = [
  '#0ea5e9',
  '#7c3aed',
  '#16a34a',
  '#ea580c',
  '#db2777',
  '#ca8a04',
  '#0d9488',
  '#6366f1',
];

const EDGE_KINDS: DependencyGraphEdgeKind[] = [
  {
    id: EDGE_KIND.DEPENDS_ON,
    label: 'Depends on',
    color: '#9ca3af',
    dash: [],
    isDefaultStyle: true,
  },
];

const DETAIL_SECTIONS: DependencyGraphDetailSection[] = [
  {
    title: 'Depends on',
    direction: 'dependsOn',
    kinds: [EDGE_KIND.DEPENDS_ON],
  },
  {
    title: 'Used by',
    direction: 'dependedOnBy',
    kinds: [EDGE_KIND.DEPENDS_ON],
  },
];

const LABELS: Partial<DependencyGraphLabels> = {
  searchLabel: 'Search components',
  searchPlaceholder: 'Search components…',
  groupFilterLabel: 'Library',
  graphLabel:
    'Component dependency graph. Drag or use arrow keys to pan, scroll or use plus and minus to zoom, 0 resets the view. Tab moves between components and Enter selects one.',
  empty: 'No components match.',
  count: ({ visible, total }) => `${visible} of ${total} components`,
};

const INITIAL_STATE: DependencyGraphState = {
  selected: null,
  group: DEPENDENCY_GRAPH_ALL_GROUPS,
  search: '',
  edgeKinds: new Set([EDGE_KIND.DEPENDS_ON]),
};

export interface ComponentGraphEntry {
  id: string;
  label: string;
  lib: string;
}

// Entries that neither depend on nor are depended on stay off the canvas.
const buildGraph = (entries: ComponentGraphEntry[]) => {
  const known = new Map(entries.map(entry => [entry.id, entry]));
  const edges: DependencyGraphEdge[] = Object.entries(DEPENDS_ON).flatMap(
    ([source, items]) =>
      items
        .filter(
          ({ entryId }) => entryId && entryId !== source && known.has(entryId),
        )
        .map(({ entryId }) => ({
          source,
          target: entryId as string,
          kind: EDGE_KIND.DEPENDS_ON,
        })),
  );
  const connected = new Set(
    edges.flatMap(({ source, target }) => [source, target]),
  );
  const nodes: DependencyGraphNode[] = entries
    .filter(entry => connected.has(entry.id))
    .map(entry => ({
      id: entry.id,
      label: entry.label,
      title: entry.label,
      group: entry.lib,
    }));
  const libs = [...new Set(nodes.map(node => node.group))].sort();
  const groups: DependencyGraphGroup[] = libs.map((lib, index) => ({
    id: lib,
    label: lib,
    filterLabel: lib,
    color: GROUP_COLORS[index % GROUP_COLORS.length],
  }));
  return { nodes, edges, groups };
};

export const ComponentGraphDemo = ({
  entries,
  onOpen,
}: {
  entries: ComponentGraphEntry[];
  onOpen: (id: string) => void;
}) => {
  const [state, setState] = useState(INITIAL_STATE);
  const { nodes, edges, groups } = useMemo(
    () => buildGraph(entries),
    [entries],
  );
  const detailAction = useMemo(
    () => ({ label: OPEN_LABEL, onSelect: onOpen }),
    [onOpen],
  );

  return (
    <div className="flex h-[40rem] max-h-[80vh] min-h-0 flex-col">
      <DependencyGraph
        nodes={nodes}
        edges={edges}
        groups={groups}
        edgeKinds={EDGE_KINDS}
        detailSections={DETAIL_SECTIONS}
        state={state}
        onStateChange={changes =>
          setState(previous => ({ ...previous, ...changes }))
        }
        settingsStoragePrefix={SETTINGS_STORAGE_PREFIX}
        labels={LABELS}
        detailAction={detailAction}
        showGroupFilter={false}
        showLegend={false}
      />
    </div>
  );
};
