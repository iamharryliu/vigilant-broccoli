import Fuse from 'fuse.js';
import type { DocsNode, DocsSearchResult } from '@vigilant-broccoli/react-lib';

const GITHUB_REPO = 'iamharryliu/vigilant-broccoli';
const NOTES_PATH = 'notes';
const GITHUB_API = 'https://api.github.com';
const GITHUB_RAW = 'https://raw.githubusercontent.com';
const BRANCH = 'main';
const ITEM_TYPE_BLOB = 'blob';
const ITEM_TYPE_TREE = 'tree';
const MD_EXT = '.md';
const PATH_SEP = '/';
const CONTENT_FETCH_CONCURRENCY = 8;
const EXCERPT_CONTEXT_CHARS = 100;

interface GithubTreeItem {
  path: string;
  type: typeof ITEM_TYPE_BLOB | typeof ITEM_TYPE_TREE;
  sha: string;
}

interface GithubTreeResponse {
  tree: GithubTreeItem[];
}

let treeCache: DocsNode[] | null = null;
let flatFilesCache: { name: string; path: string }[] | null = null;
let contentCache: Map<string, string> | null = null;
let contentCachePromise: Promise<Map<string, string>> | null = null;

const buildTree = (items: GithubTreeItem[]): DocsNode[] => {
  const root: DocsNode[] = [];
  const byPath: Record<string, DocsNode> = {};

  const mdItems = items.filter(
    item =>
      (item.type === ITEM_TYPE_BLOB && item.path.endsWith(MD_EXT)) ||
      item.type === ITEM_TYPE_TREE,
  );

  for (const item of mdItems) {
    const rel = item.path.slice(NOTES_PATH.length + 1);
    if (!rel) continue;
    const parts = rel.split(PATH_SEP);
    const name = parts[parts.length - 1];

    if (item.type === ITEM_TYPE_TREE) {
      const node: DocsNode = {
        name,
        path: rel,
        type: 'directory',
        children: [],
      };
      byPath[rel] = node;
    } else {
      const node: DocsNode = { name, path: rel, type: 'file' };
      byPath[rel] = node;
    }
  }

  for (const rel of Object.keys(byPath)) {
    const parts = rel.split(PATH_SEP);
    if (parts.length === 1) {
      root.push(byPath[rel]);
    } else {
      const parentRel = parts.slice(0, -1).join(PATH_SEP);
      const parent = byPath[parentRel];
      if (parent?.children) {
        parent.children.push(byPath[rel]);
      }
    }
  }

  const sort = (nodes: DocsNode[]): DocsNode[] =>
    nodes
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map(n => ({
        ...n,
        children: n.children ? sort(n.children) : undefined,
      }));

  return sort(root);
};

export const fetchStructure = async (): Promise<DocsNode[]> => {
  if (treeCache) return treeCache;
  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_REPO}/git/trees/${BRANCH}?recursive=1`,
  );
  const data: GithubTreeResponse = await res.json();
  const notesItems = data.tree.filter(item =>
    item.path.startsWith(`${NOTES_PATH}${PATH_SEP}`),
  );
  treeCache = buildTree(notesItems);
  flatFilesCache = notesItems
    .filter(i => i.type === ITEM_TYPE_BLOB && i.path.endsWith(MD_EXT))
    .map(i => ({
      name: i.path.split(PATH_SEP).pop() ?? i.path,
      path: i.path.slice(NOTES_PATH.length + 1),
    }));
  return treeCache;
};

export const fetchContent = async (path: string): Promise<string> => {
  const res = await fetch(
    `${GITHUB_RAW}/${GITHUB_REPO}/${BRANCH}/${NOTES_PATH}/${path}`,
  );
  if (!res.ok) throw new Error(`Failed to load: ${path}`);
  return res.text();
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

export const searchDocs = async (
  query: string,
): Promise<DocsSearchResult[]> => {
  if (!flatFilesCache) await fetchStructure();
  const files = flatFilesCache ?? [];

  const filenameFuse = new Fuse(files, {
    keys: ['name', 'path'],
    threshold: 0.4,
    includeScore: true,
  });
  const filenameMatches: DocsSearchResult[] = filenameFuse
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
