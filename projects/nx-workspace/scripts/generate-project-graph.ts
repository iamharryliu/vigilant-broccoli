import { createProjectGraphAsync } from '@nx/devkit';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, normalize } from 'path';

const OUTPUT_FILE =
  process.argv[2] ?? 'apps/ui/pages-index/public/project-graph.json';

// The page is publicly served: emit visibility:public projects plus the libs
// they depend on (already shipped in public bundles) and the apps linked by
// README App Dependencies, never a private project or an edge touching one.
const PUBLIC_TAG = 'visibility:public';
const PRIVATE_TAG = 'visibility:private';
const PROJECT_TYPE = { APP: 'app', LIB: 'lib' } as const;
const NX_LIB_TYPE = 'lib';
const NX_APP_TYPE = 'app';

const DEPENDENCY_KIND = {
  LIB: 'lib',
  EMBEDS: 'embeds',
  CALLS: 'calls',
} as const;
type DependencyKind = (typeof DEPENDENCY_KIND)[keyof typeof DEPENDENCY_KIND];
const RUNTIME_KINDS: readonly string[] = [
  DEPENDENCY_KIND.EMBEDS,
  DEPENDENCY_KIND.CALLS,
];

const README_FILE = 'README.md';
const APP_DEPENDENCIES_HEADING = '## App Dependencies';
const SECTION_HEADING_PREFIX = '## ';
const BULLET_PREFIX = '- ';
const APP_DEPENDENCY_BULLET = /^- \[[^\]]+\]\(([^)\s]+)\) - (\S+)$/;
const TRAILING_SLASH = /\/+$/;

interface Dependency {
  source: string;
  target: string;
  kind: DependencyKind;
}

const fail = (message: string): never => {
  throw new Error(message);
};

const readSectionBullets = (readmePath: string): string[] => {
  const lines = readFileSync(readmePath, 'utf8').split('\n');
  const start = lines.findIndex(
    line => line.trim() === APP_DEPENDENCIES_HEADING,
  );
  if (start === -1) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(line => line.startsWith(SECTION_HEADING_PREFIX));
  return (end === -1 ? rest : rest.slice(0, end))
    .map(line => line.trim())
    .filter(line => line.startsWith(BULLET_PREFIX));
};

const main = async () => {
  const graph = await createProjectGraphAsync({ exitOnError: true });

  const hasTag = (name: string, tag: string) =>
    graph.nodes[name]?.data.tags?.includes(tag) ?? false;

  const internalTargets = (name: string) => [
    ...new Set(
      (graph.dependencies[name] ?? [])
        .map(dep => dep.target)
        .filter(
          target =>
            target !== name &&
            graph.nodes[target] &&
            !hasTag(target, PRIVATE_TAG),
        ),
    ),
  ];

  const projectByRoot = new Map(
    Object.values(graph.nodes).map(node => [
      normalize(node.data.root),
      node.name,
    ]),
  );

  const readRuntimeDependencies = (source: string): Dependency[] => {
    const root = graph.nodes[source].data.root;
    const readmePath = join(root, README_FILE);
    if (!existsSync(readmePath)) return [];
    return readSectionBullets(readmePath).map(bullet => {
      const match = APP_DEPENDENCY_BULLET.exec(bullet);
      if (!match) {
        return fail(
          `${readmePath}: malformed ${APP_DEPENDENCIES_HEADING} bullet "${bullet}"; expected "- [<Title>](<path>) - <kind>"`,
        );
      }
      const [, href, kind] = match;
      if (!RUNTIME_KINDS.includes(kind)) {
        return fail(
          `${readmePath}: unknown kind "${kind}" for ${href}; expected one of ${RUNTIME_KINDS.join(', ')}`,
        );
      }
      const target = projectByRoot.get(
        normalize(join(root, href)).replace(TRAILING_SLASH, ''),
      );
      if (!target || target === source) {
        return fail(
          `${readmePath}: link ${href} does not resolve to another Nx project root`,
        );
      }
      return { source, target, kind: kind as DependencyKind };
    });
  };

  const runtimeDependencies = Object.keys(graph.nodes)
    .filter(name => graph.nodes[name].type === NX_APP_TYPE)
    .flatMap(readRuntimeDependencies)
    .filter(
      ({ source, target }) =>
        !hasTag(source, PRIVATE_TAG) && !hasTag(target, PRIVATE_TAG),
    );

  const included = new Set<string>();
  const visit = (name: string) => {
    if (included.has(name)) return;
    included.add(name);
    internalTargets(name).forEach(visit);
  };
  Object.keys(graph.nodes)
    .filter(name => hasTag(name, PUBLIC_TAG))
    .forEach(visit);
  // Runtime-only apps join without their libs: those libs are not shipped in
  // a public bundle, so only lib edges to projects already in the graph show.
  runtimeDependencies.forEach(({ source, target }) =>
    [source, target].forEach(name => included.add(name)),
  );

  const projects = [...included]
    .sort((a, b) => a.localeCompare(b))
    .map(name => {
      const node = graph.nodes[name];
      return {
        name,
        type: node.type === NX_LIB_TYPE ? PROJECT_TYPE.LIB : PROJECT_TYPE.APP,
        tags: [...(node.data.tags ?? [])].sort(),
      };
    });

  const libDependencies: Dependency[] = projects.flatMap(({ name: source }) =>
    internalTargets(source)
      .filter(target => included.has(target))
      .map(target => ({ source, target, kind: DEPENDENCY_KIND.LIB })),
  );

  const dependencies = [...libDependencies, ...runtimeDependencies].sort(
    (a, b) =>
      a.source.localeCompare(b.source) ||
      a.target.localeCompare(b.target) ||
      a.kind.localeCompare(b.kind),
  );

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify({ projects, dependencies }));
  console.log(
    `Wrote ${projects.length} projects and ${dependencies.length} dependencies to ${OUTPUT_FILE}`,
  );
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
