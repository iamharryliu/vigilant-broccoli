import Fuse from 'fuse.js';
import type {
  DocsNode,
  DocsSearchResult,
  NoteGraph,
} from '@vigilant-broccoli/react-lib';

// Reads the static snapshot written by scripts/build-docs-snapshot.mjs
// (structure.json, graph.json, search-index.json, notes/**) under one base URL.
const STRUCTURE_FILE = 'structure.json';
const GRAPH_FILE = 'graph.json';
const SEARCH_INDEX_FILE = 'search-index.json';
const NOTES_DIR = 'notes';
const NODE_TYPE_FILE = 'file';
const PATH_SEP = '/';
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

interface SearchIndexEntry extends FlatFile {
  content: string;
}

export interface DocsSnapshotSource {
  fetchStructure: () => Promise<DocsNode[]>;
  fetchContent: (path: string) => Promise<string>;
  fetchGraph: () => Promise<NoteGraph>;
  searchDocs: (query: string) => Promise<DocsSearchResult[]>;
}

const flatten = (nodes: DocsNode[]): FlatFile[] =>
  nodes.flatMap(node =>
    node.type === NODE_TYPE_FILE
      ? [{ name: node.name, path: node.path }]
      : flatten(node.children ?? []),
  );

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

const fetchJson = async <T>(url: string, errorMessage: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(errorMessage);
  return res.json();
};

export const createDocsSnapshotSource = (baseUrl = ''): DocsSnapshotSource => {
  let treeCache: DocsNode[] | null = null;
  let flatFilesCache: FlatFile[] | null = null;
  let filenameFuseCache: Fuse<FlatFile> | null = null;
  let graphCache: NoteGraph | null = null;
  let contentCachePromise: Promise<Map<string, string>> | null = null;

  const fetchStructure = async (): Promise<DocsNode[]> => {
    if (treeCache) return treeCache;
    const nodes = await fetchJson<DocsNode[]>(
      `${baseUrl}${STRUCTURE_FILE}`,
      'Failed to load docs structure',
    );
    treeCache = nodes;
    flatFilesCache = flatten(nodes);
    return treeCache;
  };

  const fetchContent = async (path: string): Promise<string> => {
    const res = await fetch(`${baseUrl}${NOTES_DIR}${PATH_SEP}${path}`);
    if (!res.ok) throw new Error(`Failed to load: ${path}`);
    return res.text();
  };

  const fetchGraph = async (): Promise<NoteGraph> => {
    if (graphCache) return graphCache;
    graphCache = await fetchJson<NoteGraph>(
      `${baseUrl}${GRAPH_FILE}`,
      'Failed to load graph',
    );
    return graphCache;
  };

  const fetchAllFileContents = (): Promise<Map<string, string>> => {
    if (!contentCachePromise) {
      contentCachePromise = fetchJson<SearchIndexEntry[]>(
        `${baseUrl}${SEARCH_INDEX_FILE}`,
        'Failed to load search index',
      ).then(
        entries =>
          new Map<string, string>(
            entries.map(entry => [entry.path, entry.content]),
          ),
      );
    }
    return contentCachePromise;
  };

  const getFilenameFuse = (files: FlatFile[]): Fuse<FlatFile> => {
    if (!filenameFuseCache) {
      filenameFuseCache = new Fuse(files, FILENAME_FUSE_OPTIONS);
    }
    return filenameFuseCache;
  };

  const searchDocs = async (query: string): Promise<DocsSearchResult[]> => {
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

  return { fetchStructure, fetchContent, fetchGraph, searchDocs };
};
