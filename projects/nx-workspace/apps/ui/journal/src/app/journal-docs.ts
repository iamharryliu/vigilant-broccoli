import Fuse from 'fuse.js';
import type { DocsNode, DocsSearchResult } from '@vigilant-broccoli/react-lib';

const STRUCTURE_URL = 'structure.json';
const NOTES_DIR = 'notes';
const NODE_TYPE_FILE = 'file';
const PATH_SEP = '/';

interface FlatFile {
  name: string;
  path: string;
}

let treeCache: DocsNode[] | null = null;
let flatFilesCache: FlatFile[] | null = null;

const flatten = (nodes: DocsNode[]): FlatFile[] =>
  nodes.flatMap(node =>
    node.type === NODE_TYPE_FILE
      ? [{ name: node.name, path: node.path }]
      : flatten(node.children ?? []),
  );

export const fetchStructure = async (): Promise<DocsNode[]> => {
  if (treeCache) return treeCache;
  const res = await fetch(STRUCTURE_URL);
  if (!res.ok) throw new Error('Failed to load journal structure');
  const nodes: DocsNode[] = await res.json();
  treeCache = nodes;
  flatFilesCache = flatten(nodes);
  return treeCache;
};

export const fetchContent = async (path: string): Promise<string> => {
  const res = await fetch(`${NOTES_DIR}${PATH_SEP}${path}`);
  if (!res.ok) throw new Error(`Failed to load: ${path}`);
  return res.text();
};

export const searchDocs = async (
  query: string,
): Promise<DocsSearchResult[]> => {
  if (!flatFilesCache) await fetchStructure();
  const files = flatFilesCache ?? [];
  const fuse = new Fuse(files, {
    keys: ['name', 'path'],
    threshold: 0.4,
    includeScore: true,
  });
  return fuse.search(query).map(r => ({
    name: r.item.name,
    path: r.item.path,
    matchType: 'filename' as const,
    score: r.score ?? 0,
  }));
};
