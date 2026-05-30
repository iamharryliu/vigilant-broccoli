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
