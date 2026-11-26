import { useCallback, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { SegmentedControl } from '@vigilant-broccoli/react-lib';
import {
  GRAPH_COLOR_SCHEMES,
  type GraphColorScheme,
} from './graph-color-schemes';
import {
  GraphSettingsFields,
  GraphSettingsMenu,
  useGraphSettings,
} from './graph-settings';
import type { NoteGraph } from './DocsExplorer';
import { GraphView, type GraphLinkStyle } from './graph-view';

export const DEPENDENCY_GRAPH_ALL_GROUPS = 'all';

export interface DependencyGraphNode {
  id: string;
  // Canvas label.
  label: string;
  // Detail panel and neighbor lists; defaults to the id.
  title?: string;
  group: string;
  tags?: string[];
}

export interface DependencyGraphEdge {
  // `source` depends on `target`.
  source: string;
  target: string;
  kind: string;
}

export interface DependencyGraphGroup {
  id: string;
  label: string;
  // Segmented filter option.
  filterLabel: string;
  // Concrete #rrggbb or hsl(): the canvas cannot resolve CSS variables.
  color: string;
}

export interface DependencyGraphEdgeKind {
  id: string;
  label: string;
  color: string;
  dash: readonly number[];
  // Leaves the link unstyled so GraphView's default color and focus highlight
  // apply; the color and dash still draw the legend swatch.
  isDefaultStyle?: boolean;
}

export interface DependencyGraphDetailSection {
  title: string;
  direction: 'dependsOn' | 'dependedOnBy';
  kinds: string[];
  // Node groups the section is shown for; omitted shows it for every node.
  groups?: string[];
  showKind?: boolean;
}

export interface DependencyGraphState {
  selected: string | null;
  group: string;
  search: string;
  edgeKinds: ReadonlySet<string>;
}

export interface DependencyGraphLabels {
  searchLabel: string;
  searchPlaceholder: string;
  groupFilterLabel: string;
  groupFilterAll: string;
  edgeFilterLabel: string;
  graphLabel: string;
  zoomIn: string;
  zoomOut: string;
  resetView: string;
  closeDetails: string;
  none: string;
  empty: string;
  count: (counts: { visible: number; total: number }) => string;
}

export const DEFAULT_DEPENDENCY_GRAPH_LABELS: DependencyGraphLabels = {
  searchLabel: 'Search',
  searchPlaceholder: 'Search…',
  groupFilterLabel: 'Group',
  groupFilterAll: 'All',
  edgeFilterLabel: 'Dependency kinds',
  graphLabel:
    'Dependency graph. Drag or use arrow keys to pan, scroll or use plus and minus to zoom, 0 resets the view. Tab moves between nodes and Enter selects one.',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  resetView: 'Reset view',
  closeDetails: 'Close details',
  none: 'None',
  empty: 'Nothing matches.',
  count: ({ visible, total }) => `${visible} of ${total}`,
};

interface Neighbor {
  id: string;
  kind: string;
}

interface Adjacency {
  dependsOn: Map<string, Neighbor[]>;
  dependedOnBy: Map<string, Neighbor[]>;
}

const EMPTY_LIST: Neighbor[] = [];
const ICON_CLASS = 'h-4 w-4 shrink-0';
const EDGE_SWATCH_WIDTH = 18;
const HUES_SCHEME_ID = GRAPH_COLOR_SCHEMES.find(
  scheme => scheme.colors === null,
)?.id;

const pushTo = (
  map: Map<string, Neighbor[]>,
  key: string,
  neighbor: Neighbor,
) => map.set(key, [...(map.get(key) ?? []), neighbor]);

const buildAdjacency = (edges: DependencyGraphEdge[]): Adjacency =>
  edges.reduce<Adjacency>(
    (adjacency, { source, target, kind }) => {
      pushTo(adjacency.dependsOn, source, { id: target, kind });
      pushTo(adjacency.dependedOnBy, target, { id: source, kind });
      return adjacency;
    },
    { dependsOn: new Map(), dependedOnBy: new Map() },
  );

const getNeighborIds = (adjacency: Adjacency, id: string) =>
  [
    ...(adjacency.dependsOn.get(id) ?? []),
    ...(adjacency.dependedOnBy.get(id) ?? []),
  ].map(neighbor => neighbor.id);

// Search keeps each match plus its direct neighbors so a node's dependencies
// stay visible while narrowing.
const getVisibleNodes = (
  nodes: DependencyGraphNode[],
  adjacency: Adjacency,
  group: string,
  search: string,
): DependencyGraphNode[] => {
  const byGroup =
    group === DEPENDENCY_GRAPH_ALL_GROUPS
      ? nodes
      : nodes.filter(node => node.group === group);
  const query = search.trim().toLowerCase();
  if (!query) return byGroup;
  const keep = new Set(
    byGroup
      .filter(
        node =>
          node.id.toLowerCase().includes(query) ||
          node.label.toLowerCase().includes(query),
      )
      .flatMap(node => [node.id, ...getNeighborIds(adjacency, node.id)]),
  );
  return byGroup.filter(node => keep.has(node.id));
};

// A chosen scheme assigns its colors to groups by position; the scheme-less
// default keeps each group's own color.
const resolveGroupColors = (
  groups: DependencyGraphGroup[],
  colorScheme: GraphColorScheme,
): Record<string, string> =>
  Object.fromEntries(
    groups.map((group, index) => [
      group.id,
      colorScheme.colors?.[index] ?? group.color,
    ]),
  );

interface GraphCanvasProps {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  groupColors: Record<string, string>;
  edgeKinds: DependencyGraphEdgeKind[];
  settings: ReturnType<typeof useGraphSettings>;
  labels: DependencyGraphLabels;
}

function GraphCanvas({
  nodes,
  edges,
  selected,
  onSelect,
  groupColors,
  edgeKinds,
  settings,
  labels,
}: GraphCanvasProps) {
  const linkStyles = useMemo<Record<string, GraphLinkStyle>>(
    () =>
      Object.fromEntries(
        edgeKinds
          .filter(kind => !kind.isDefaultStyle)
          .map(({ id, color, dash }) => [id, { color, dash }]),
      ),
    [edgeKinds],
  );

  const graph = useMemo<NoteGraph>(() => {
    const visible = new Set(nodes.map(node => node.id));
    return {
      nodes: nodes.map(node => ({
        id: node.id,
        name: node.label,
        group: node.group,
      })),
      links: edges.filter(
        ({ source, target }) => visible.has(source) && visible.has(target),
      ),
    };
  }, [nodes, edges]);

  // GraphView rebuilds its simulation when onSelect changes, so the callback
  // stays stable and reads the current selection from a ref.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const handleSelect = useCallback(
    (id: string) => onSelectRef.current(id === selectedRef.current ? null : id),
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
        keyboardLabel={labels.graphLabel}
        zoomControls={{
          zoomIn: labels.zoomIn,
          zoomOut: labels.zoomOut,
          reset: labels.resetView,
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

interface NeighborListProps {
  title: string;
  neighbors: Neighbor[];
  titles: Map<string, string>;
  kindLabels: Map<string, string>;
  showKind: boolean;
  noneLabel: string;
  onSelect: (id: string) => void;
}

function NeighborList({
  title,
  neighbors,
  titles,
  kindLabels,
  showKind,
  noneLabel,
  onSelect,
}: NeighborListProps) {
  return (
    <section className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title} ({neighbors.length})
      </h3>
      {neighbors.length === 0 ? (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {noneLabel}
        </p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {neighbors.map(({ id, kind }) => (
            <li key={`${id}|${kind}`}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                className="flex w-full items-center justify-between gap-2 rounded px-1.5 py-1 text-left text-sm text-sky-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-sky-500 dark:text-sky-300 dark:hover:bg-gray-700"
              >
                <span className="truncate">{titles.get(id) ?? id}</span>
                {showKind && (
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {kindLabels.get(kind) ?? kind}
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
  node: DependencyGraphNode;
  groupLabel: string;
  adjacency: Adjacency;
  titles: Map<string, string>;
  kindLabels: Map<string, string>;
  sections: DependencyGraphDetailSection[];
  labels: DependencyGraphLabels;
  action?: DependencyGraphDetailAction;
  onSelect: (id: string) => void;
  onClose: () => void;
}

function DetailPanel({
  node,
  groupLabel,
  adjacency,
  titles,
  kindLabels,
  sections,
  labels,
  action,
  onSelect,
  onClose,
}: DetailPanelProps) {
  const neighborsFor = (section: DependencyGraphDetailSection) =>
    [...(adjacency[section.direction].get(node.id) ?? EMPTY_LIST)]
      .filter(({ kind }) => section.kinds.includes(kind))
      .sort(
        (a, b) =>
          (titles.get(a.id) ?? a.id).localeCompare(titles.get(b.id) ?? b.id) ||
          a.kind.localeCompare(b.kind),
      );

  return (
    <aside className="max-h-[40%] shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 md:max-h-none md:w-72">
      <div className="flex items-start justify-between gap-2">
        <h2 className="break-all text-sm font-semibold">
          {node.title ?? node.id}
        </h2>
        <button
          type="button"
          aria-label={labels.closeDetails}
          title={labels.closeDetails}
          onClick={onClose}
          className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-sky-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          <X className={ICON_CLASS} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-700">
          {groupLabel}
        </span>
        {node.tags?.map(tag => (
          <span
            key={tag}
            className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:border-gray-600 dark:text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
      {action && (
        <button
          type="button"
          onClick={() => action.onSelect(node.id)}
          className="mt-3 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-sky-500 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {action.label}
        </button>
      )}
      {sections
        .filter(
          section => !section.groups || section.groups.includes(node.group),
        )
        .map(section => (
          <NeighborList
            key={`${section.direction}|${section.title}`}
            title={section.title}
            neighbors={neighborsFor(section)}
            titles={titles}
            kindLabels={kindLabels}
            showKind={section.showKind ?? false}
            noneLabel={labels.none}
            onSelect={onSelect}
          />
        ))}
    </aside>
  );
}

interface EdgeKindTogglesProps {
  kinds: DependencyGraphEdgeKind[];
  enabled: ReadonlySet<string>;
  label: string;
  onChange: (kinds: Set<string>) => void;
}

// Doubles as the edge legend: each toggle shows its kind's line style. The
// last enabled kind cannot be turned off, so the graph never loses all edges.
function EdgeKindToggles({
  kinds,
  enabled,
  label,
  onChange,
}: EdgeKindTogglesProps) {
  const toggle = (id: string) => {
    const next = new Set(enabled);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    if (next.size) onChange(next);
  };

  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-1"
    >
      {kinds.map(kind => {
        const pressed = enabled.has(kind.id);
        return (
          <button
            key={kind.id}
            type="button"
            aria-pressed={pressed}
            onClick={() => toggle(kind.id)}
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
                stroke={kind.color}
                strokeWidth={2}
                strokeDasharray={kind.dash.join(' ') || undefined}
              />
            </svg>
            {kind.label}
          </button>
        );
      })}
    </div>
  );
}

function Legend({
  groups,
  colors,
}: {
  groups: DependencyGraphGroup[];
  colors: Record<string, string>;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
      {groups.map(group => (
        <span key={group.id} className="flex items-center gap-1">
          <svg aria-hidden width={12} height={12} viewBox="-6 -6 12 12">
            <circle r={5} fill={colors[group.id]} />
          </svg>
          {group.label}
        </span>
      ))}
    </div>
  );
}

export interface DependencyGraphDetailAction {
  label: string;
  onSelect: (id: string) => void;
}

export interface DependencyGraphProps {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
  groups: DependencyGraphGroup[];
  edgeKinds: DependencyGraphEdgeKind[];
  detailSections: DependencyGraphDetailSection[];
  // Controlled so each host decides where the state lives (URL, local state).
  state: DependencyGraphState;
  onStateChange: (changes: Partial<DependencyGraphState>) => void;
  // Prefix for the persisted gear-menu settings, kept apart per graph.
  settingsStoragePrefix: string;
  labels?: Partial<DependencyGraphLabels>;
  detailAction?: DependencyGraphDetailAction;
  // Hosts with many groups can drop the group filter and legend; groups still
  // color the nodes.
  showGroupFilter?: boolean;
  showLegend?: boolean;
}

// Search, group filter, edge-kind toggles, canvas and detail panel shared by
// the project graph and the component graph. Hosts supply data, colors and
// copy; the layout and behavior live here so a change reaches both.
export function DependencyGraph({
  nodes,
  edges,
  groups,
  edgeKinds,
  detailSections,
  state,
  onStateChange,
  settingsStoragePrefix,
  labels: labelOverrides,
  detailAction,
  showGroupFilter = true,
  showLegend = true,
}: DependencyGraphProps) {
  const labels = useMemo(
    () => ({ ...DEFAULT_DEPENDENCY_GRAPH_LABELS, ...labelOverrides }),
    [labelOverrides],
  );
  const settings = useGraphSettings(settingsStoragePrefix, HUES_SCHEME_ID);
  const groupColors = useMemo(
    () => resolveGroupColors(groups, settings.colorScheme),
    [groups, settings.colorScheme],
  );
  const titles = useMemo(
    () => new Map(nodes.map(node => [node.id, node.title ?? node.id])),
    [nodes],
  );
  const kindLabels = useMemo(
    () => new Map(edgeKinds.map(kind => [kind.id, kind.label])),
    [edgeKinds],
  );

  // The detail panel lists every kind; the canvas and search neighbors follow
  // the edge-kind toggles.
  const adjacency = useMemo(() => buildAdjacency(edges), [edges]);
  const shownEdges = useMemo(
    () => edges.filter(({ kind }) => state.edgeKinds.has(kind)),
    [edges, state.edgeKinds],
  );
  const shownAdjacency = useMemo(
    () => buildAdjacency(shownEdges),
    [shownEdges],
  );
  const visibleNodes = useMemo(
    () => getVisibleNodes(nodes, shownAdjacency, state.group, state.search),
    [nodes, shownAdjacency, state.group, state.search],
  );
  const selectedNode = nodes.find(node => node.id === state.selected);

  // A node picked from the detail panel may be filtered out; clear the
  // filters so it is on the canvas.
  const selectFromPanel = (id: string) =>
    onStateChange(
      visibleNodes.some(node => node.id === id)
        ? { selected: id }
        : { selected: id, group: DEPENDENCY_GRAPH_ALL_GROUPS, search: '' },
    );

  return (
    <>
      <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
        <input
          type="search"
          value={state.search}
          onChange={event => onStateChange({ search: event.target.value })}
          aria-label={labels.searchLabel}
          placeholder={labels.searchPlaceholder}
          className="h-9 min-w-0 flex-1 basis-48 rounded-md border border-gray-200 bg-white px-3 text-sm placeholder:text-gray-400 focus-visible:outline-2 focus-visible:outline-sky-500 dark:border-gray-700 dark:bg-gray-800 dark:placeholder:text-gray-500"
        />
        {showGroupFilter && groups.length > 1 && (
          <SegmentedControl
            label={labels.groupFilterLabel}
            value={state.group}
            onChange={group => onStateChange({ group })}
            options={[
              {
                value: DEPENDENCY_GRAPH_ALL_GROUPS,
                label: labels.groupFilterAll,
              },
              ...groups.map(group => ({
                value: group.id,
                label: group.filterLabel,
              })),
            ]}
          />
        )}
      </div>
      <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          {showLegend && <Legend groups={groups} colors={groupColors} />}
          {edgeKinds.length > 1 && (
            <EdgeKindToggles
              kinds={edgeKinds}
              enabled={state.edgeKinds}
              label={labels.edgeFilterLabel}
              onChange={kinds => onStateChange({ edgeKinds: kinds })}
            />
          )}
        </div>
        <p
          className="text-xs text-gray-500 dark:text-gray-400"
          aria-live="polite"
        >
          {labels.count({ visible: visibleNodes.length, total: nodes.length })}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row">
        {visibleNodes.length === 0 ? (
          <p className="flex-1 text-sm text-gray-500 dark:text-gray-400">
            {labels.empty}
          </p>
        ) : (
          <GraphCanvas
            nodes={visibleNodes}
            edges={shownEdges}
            selected={selectedNode ? selectedNode.id : null}
            onSelect={selected => onStateChange({ selected })}
            groupColors={groupColors}
            edgeKinds={edgeKinds}
            settings={settings}
            labels={labels}
          />
        )}
        {selectedNode && (
          <DetailPanel
            node={selectedNode}
            groupLabel={
              groups.find(group => group.id === selectedNode.group)?.label ??
              selectedNode.group
            }
            adjacency={adjacency}
            titles={titles}
            kindLabels={kindLabels}
            sections={detailSections}
            labels={labels}
            action={detailAction}
            onSelect={selectFromPanel}
            onClose={() => onStateChange({ selected: null })}
          />
        )}
      </div>
    </>
  );
}
