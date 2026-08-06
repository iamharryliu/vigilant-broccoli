import Fuse from 'fuse.js';
import type {
  DocsNode,
  DocsSearchResult,
  NoteGraph,
} from '@vigilant-broccoli/react-lib';

const STRUCTURE_URL = 'structure.json';
const GRAPH_URL = 'graph.json';
const NOTES_DIR = 'notes';
const NODE_TYPE_FILE = 'file';
const PATH_SEP = '/';
const CONTENT_FETCH_CONCURRENCY = 8;
const EXCERPT_CONTEXT_CHARS = 100;
const FILENAME_FUSE_OPTIONS = {
  keys: ['name', 'path'],
  threshold: 0.4,
  includeScore: true,
};

interface FlatFile {
  name: string;
  path: string;
}

let treeCache: DocsNode[] | null = null;
let flatFilesCache: FlatFile[] | null = null;
let filenameFuseCache: Fuse<FlatFile> | null = null;
let contentCache: Map<string, string> | null = null;
let contentCachePromise: Promise<Map<string, string>> | null = null;

const flatten = (nodes: DocsNode[]): FlatFile[] =>
  nodes.flatMap(node =>
    node.type === NODE_TYPE_FILE
      ? [{ name: node.name, path: node.path }]
      : flatten(node.children ?? []),
  );

export const fetchStructure = async (): Promise<DocsNode[]> => {
  if (treeCache) return treeCache;
  const res = await fetch(STRUCTURE_URL);
  if (!res.ok) throw new Error('Failed to load docs structure');
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

let graphCache: NoteGraph | null = null;

export const fetchGraph = async (): Promise<NoteGraph> => {
  if (graphCache) return graphCache;
  const res = await fetch(GRAPH_URL);
  if (!res.ok) throw new Error('Failed to load graph');
  graphCache = await res.json();
  return graphCache as NoteGraph;
};

const fetchAllFileContents = (): Promise<Map<string, string>> => {
  if (contentCache) return Promise.resolve(contentCache);
  if (contentCachePromise) return contentCachePromise;

  contentCachePromise = (async () => {
    if (!flatFilesCache) await fetchStructure();
    const files = flatFilesCache ?? [];
    const cache = new Map<string, string>();
    const queue = [...files];

    const worker = async () => {
      for (let file = queue.shift(); file; file = queue.shift()) {
        try {
          cache.set(file.path, await fetchContent(file.path));
        } catch {
          // skip files that fail to fetch; they're just absent from content search
        }
      }
    };

    await Promise.all(
      Array.from({ length: CONTENT_FETCH_CONCURRENCY }, worker),
    );
    contentCache = cache;
    return cache;
  })();

  return contentCachePromise;
};

const getExcerpt = (
  content: string,
  index: number,
  matchLength: number,
): string => {
  const start = Math.max(0, index - EXCERPT_CONTEXT_CHARS / 2);
  const end = Math.min(
    content.length,
    index + matchLength + EXCERPT_CONTEXT_CHARS / 2,
  );
  const prefix = start > 0 ? '...' : '';
  const suffix = end < content.length ? '...' : '';
  return `${prefix}${content.slice(start, end)}${suffix}`;
};

const getFilenameFuse = (files: FlatFile[]): Fuse<FlatFile> => {
  if (!filenameFuseCache) {
    filenameFuseCache = new Fuse(files, FILENAME_FUSE_OPTIONS);
  }
  return filenameFuseCache;
};

export const searchDocs = async (
  query: string,
): Promise<DocsSearchResult[]> => {
  if (!flatFilesCache) await fetchStructure();
  const files = flatFilesCache ?? [];

  const filenameMatches: DocsSearchResult[] = getFilenameFuse(files)
    .search(query)
    .map(r => ({
      name: r.item.name,
      path: r.item.path,
      matchType: 'filename' as const,
      score: r.score ?? 0,
    }));

  const filenameMatchPaths = new Set(filenameMatches.map(m => m.path));
  const contents = await fetchAllFileContents();
  const lowerQuery = query.toLowerCase();
  const contentMatches: DocsSearchResult[] = files
    .filter(f => !filenameMatchPaths.has(f.path) && contents.has(f.path))
    .map(f => {
      const content = contents.get(f.path) ?? '';
      return {
        ...f,
        content,
        index: content.toLowerCase().indexOf(lowerQuery),
      };
    })
    .filter(f => f.index !== -1)
    .sort((a, b) => a.index - b.index)
    .map(f => ({
      name: f.name,
      path: f.path,
      matchType: 'content' as const,
      score: f.index / f.content.length,
      excerpt: getExcerpt(f.content, f.index, query.length),
    }));

  return [
    ...filenameMatches.sort((a, b) => a.score - b.score),
    ...contentMatches,
  ];
};
