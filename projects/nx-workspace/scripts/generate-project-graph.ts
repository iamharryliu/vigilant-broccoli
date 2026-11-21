import { createProjectGraphAsync } from '@nx/devkit';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

const OUTPUT_FILE =
  process.argv[2] ?? 'apps/ui/pages-index/public/project-graph.json';

// The page is publicly served: emit visibility:public projects plus the libs
// they depend on (already shipped in public bundles), never a private project.
const PUBLIC_TAG = 'visibility:public';
const PRIVATE_TAG = 'visibility:private';
const PROJECT_TYPE = { APP: 'app', LIB: 'lib' } as const;
const NX_LIB_TYPE = 'lib';

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

  const included = new Set<string>();
  const visit = (name: string) => {
    if (included.has(name)) return;
    included.add(name);
    internalTargets(name).forEach(visit);
  };
  Object.keys(graph.nodes)
    .filter(name => hasTag(name, PUBLIC_TAG))
    .forEach(visit);

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

  const dependencies = projects.flatMap(({ name: source }) =>
    internalTargets(source)
      .sort()
      .map(target => ({ source, target })),
  );

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, JSON.stringify({ projects, dependencies }));
  console.log(
    `Wrote ${projects.length} projects and ${dependencies.length} dependencies to ${OUTPUT_FILE}`,
  );
};

main();
