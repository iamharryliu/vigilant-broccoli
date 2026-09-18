import fs from 'fs';
import path from 'path';

const MD_EXT = '.md';
const NODE_TYPE_FILE = 'file';
const NODE_TYPE_DIRECTORY = 'directory';
const IGNORE = [
  /(^|\/)\.git(\/|$)/,
  /(^|\/)\.obsidian(\/|$)/,
  /(^|\/)node_modules(\/|$)/,
  /(^|\/)dist(\/|$)/,
  /(^|\/)\.nx(\/|$)/,
  /__pycache__/,
];

const NOTES_DIR = 'notes';
const STRUCTURE_FILE = 'structure.json';
const GRAPH_FILE = 'graph.json';
const SEARCH_INDEX_FILE = 'search-index.json';

const PATH_SEP = '/';
const CURRENT_SEGMENT = '.';
const PARENT_SEGMENT = '..';
const HASH_SEP = '#';
const EXTERNAL_OR_HASH_HREF_RE = /^([a-z][a-z0-9+.-]*:|#)/i;
const MD_LINK_RE = /\]\(\s*(<[^>]+>|[^)\s]+)/g;
const ANGLE_WRAPPED_RE = /^<(.+)>$/;

const shouldIgnore = p => IGNORE.some(re => re.test(p));

const toSource = entry => (typeof entry === 'string' ? { path: entry } : entry);

const normalizeRel = rel =>
  rel
    .split(PATH_SEP)
    .filter(segment => segment && segment !== CURRENT_SEGMENT)
    .join(PATH_SEP);

const sort = nodes =>
  nodes
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === NODE_TYPE_DIRECTORY ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map(n => (n.children ? { ...n, children: sort(n.children) } : n));

const matchesSource = (source, name, content) =>
  (!source.filename || source.filename === name) &&
  (!source.contains || content.includes(source.contains));

const collect = (root, outDir, source, filesByPath) => {
  const visit = abs => {
    if (shouldIgnore(abs) || abs === outDir) return;
    const rel = normalizeRel(path.relative(root, abs));
    if (fs.statSync(abs).isDirectory()) {
      for (const entry of fs.readdirSync(abs)) visit(path.join(abs, entry));
      return;
    }
    if (!abs.endsWith(MD_EXT) || filesByPath.has(rel)) return;
    const content = fs.readFileSync(abs, 'utf8');
    if (!matchesSource(source, path.basename(abs), content)) return;
    filesByPath.set(rel, { name: path.basename(abs), path: rel, content });
  };
  visit(path.resolve(root, source.path));
};

const buildTree = files => {
  const rootChildren = [];
  const dirNodes = new Map();
  const dirNode = dir => {
    if (!dir) return rootChildren;
    const existing = dirNodes.get(dir);
    if (existing) return existing.children;
    const node = {
      name: path.basename(dir),
      path: dir,
      type: NODE_TYPE_DIRECTORY,
      children: [],
    };
    dirNodes.set(dir, node);
    dirNode(
      path.dirname(dir) === CURRENT_SEGMENT ? '' : path.dirname(dir),
    ).push(node);
    return node.children;
  };
  for (const file of files) {
    const dir = file.path.includes(PATH_SEP)
      ? file.path.slice(0, file.path.lastIndexOf(PATH_SEP))
      : '';
    dirNode(dir).push({
      name: file.name,
      path: file.path,
      type: NODE_TYPE_FILE,
    });
  }
  return sort(rootChildren);
};

const resolveNoteLink = (fromPath, href) => {
  if (!href || EXTERNAL_OR_HASH_HREF_RE.test(href)) return null;
  const [rawPath] = href.split(HASH_SEP);
  if (!rawPath) return null;
  const segments = [
    ...fromPath.split(PATH_SEP).slice(0, -1),
    ...rawPath.split(PATH_SEP),
  ];
  const resolved = [];
  for (const segment of segments) {
    if (!segment || segment === CURRENT_SEGMENT) continue;
    if (segment === PARENT_SEGMENT) resolved.pop();
    else resolved.push(segment);
  }
  return resolved.join(PATH_SEP);
};

const unwrapHref = raw => {
  const angle = ANGLE_WRAPPED_RE.exec(raw);
  return angle ? angle[1] : raw;
};

const extractHrefs = content =>
  [...content.matchAll(MD_LINK_RE)].map(match => unwrapHref(match[1]));

const createLinkResolver = knownPaths => (fromPath, href) => {
  const resolved = resolveNoteLink(fromPath, href);
  if (resolved === null) return null;
  if (knownPaths.has(resolved)) return resolved;
  const withExt = `${resolved}${MD_EXT}`;
  return knownPaths.has(withExt) ? withExt : null;
};

const buildGraph = (files, resolveToKnown) => {
  const linkKeys = new Set();
  const links = [];
  for (const file of files) {
    for (const href of extractHrefs(file.content)) {
      const target = resolveToKnown(file.path, href);
      if (!target || target === file.path) continue;
      const key = `${file.path} ${target}`;
      if (linkKeys.has(key)) continue;
      linkKeys.add(key);
      links.push({ source: file.path, target });
    }
  }

  const nodes = files.map(f => ({
    id: f.path,
    name: f.name.replace(/\.md$/, ''),
    group: f.path.includes(PATH_SEP) ? f.path.split(PATH_SEP)[0] : '',
  }));

  return { nodes, links };
};

// Links that resolve outside the snapshot (source files, notes in another viewer)
// are rewritten to an absolute URL by the longest matching prefix so the viewer
// opens them externally instead of trying to load a file it does not have.
const createLinkRewriter = (linkFallbacks, resolveToKnown) => {
  const fallbacks = [...linkFallbacks].sort(
    (a, b) => b.prefix.length - a.prefix.length,
  );
  return (filePath, content) =>
    content.replace(MD_LINK_RE, (match, rawHref) => {
      const href = unwrapHref(rawHref);
      if (EXTERNAL_OR_HASH_HREF_RE.test(href)) return match;
      if (resolveToKnown(filePath, href) !== null) return match;
      const [rawPath, hash] = href.split(HASH_SEP);
      const resolved = resolveNoteLink(filePath, rawPath);
      if (resolved === null) return match;
      const fallback = fallbacks.find(f => resolved.startsWith(f.prefix));
      if (!fallback) return match;
      const external = `${fallback.base}${resolved.slice(fallback.prefix.length)}`;
      return `](${hash ? `${external}${HASH_SEP}${hash}` : external}`;
    });
};

const [, , configPath] = process.argv;
if (!configPath) {
  console.error('Usage: node build-docs-snapshot.mjs <config.json>');
  process.exit(1);
}
const configDir = path.dirname(path.resolve(configPath));
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const root = path.resolve(configDir, config.root);
const outDir = path.resolve(configDir, config.outDir);
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error(`Invalid root directory: ${root}`);
  process.exit(1);
}

const filesByPath = new Map();
for (const source of config.sources.map(toSource)) {
  collect(root, outDir, source, filesByPath);
}
const resolveToKnown = createLinkResolver(new Set(filesByPath.keys()));
const rewriteLinks = createLinkRewriter(
  config.linkFallbacks ?? [],
  resolveToKnown,
);
const files = [...filesByPath.values()]
  .map(file => ({ ...file, content: rewriteLinks(file.path, file.content) }))
  .sort((a, b) => a.path.localeCompare(b.path));

const notesOut = path.join(outDir, NOTES_DIR);
fs.rmSync(notesOut, { recursive: true, force: true });
fs.mkdirSync(notesOut, { recursive: true });
for (const file of files) {
  const dest = path.join(notesOut, file.path);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, file.content);
}

fs.writeFileSync(
  path.join(outDir, STRUCTURE_FILE),
  JSON.stringify(buildTree(files), null, 2),
);

const graph = buildGraph(files, resolveToKnown);
fs.writeFileSync(path.join(outDir, GRAPH_FILE), JSON.stringify(graph, null, 2));

fs.writeFileSync(
  path.join(outDir, SEARCH_INDEX_FILE),
  JSON.stringify(
    files.map(({ name, path: filePath, content }) => ({
      name,
      path: filePath,
      content,
    })),
  ),
);

console.log(
  `Wrote snapshot: ${notesOut} + ${STRUCTURE_FILE} + ${GRAPH_FILE} + ${SEARCH_INDEX_FILE} ` +
    `(${graph.nodes.length} nodes, ${graph.links.length} links)`,
);
