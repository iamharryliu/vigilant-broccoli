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
const NOT_FOUND = -1;
const NO_MATCH_SCORE = Number.POSITIVE_INFINITY;
// Filename scoring keeps fuse.js' convention: 0 is a perfect hit and lower is
// better. Three tiers run in order, each confined to its own score band so a
// weaker kind of match can never outrank a stronger one, and each rejecting
// outright rather than leaning on a shared cutoff.
const CONTIGUOUS_SCORE_CEILING = 0.2;
const SUBSEQUENCE_SCORE_CEILING = 0.4;
const FUZZY_SCORE_CEILING = 0.6;
const GAP_WEIGHT = 0.7;
const OFFSET_WEIGHT = 0.3;
const SUBSEQUENCE_MAX_PENALTY = 0.25;
// One permitted edit per this many query characters. Well under fuse.js'
// effective budget of 2 on a 6-character query, which is what let `todo` reach
// `outdoor.md`; a transposition costs 1 here rather than 2, so the tighter
// budget still absorbs the typos fuse.js needed the loose one for.
const FUZZY_CHARS_PER_ERROR = 4;
const FUZZY_MIN_QUERY_LENGTH = 5;
// Both gapped tiers place a match inside its band the same way: normalise the
// tier's own penalty against the threshold that would have rejected it, then
// let coverage break ties between otherwise equal matches.
const PRIMARY_PENALTY_WEIGHT = 0.8;
const COVERAGE_WEIGHT = 0.2;
const WORD_BOUNDARY_CHARS = new Set(['-', '_', '/', '.', ' ']);

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

const scoreContiguous = (
  query: string,
  target: string,
  index: number,
): number => {
  const offset = index / target.length;
  const coverage = query.length / target.length;
  return (CONTIGUOUS_SCORE_CEILING * (offset + (1 - coverage))) / 2;
};

// Greedy in-order character scan, scored on how tightly the query packs into
// the span it matched and how early that span starts.
const scoreSubsequence = (query: string, target: string): number => {
  let start = NOT_FOUND;
  let cursor = 0;
  for (const char of query) {
    const found = target.indexOf(char, cursor);
    if (found === NOT_FOUND) return NO_MATCH_SCORE;
    if (start === NOT_FOUND) start = found;
    cursor = found + 1;
  }
  const density = query.length / (cursor - start);
  const penalty =
    (1 - density) * GAP_WEIGHT + (start / target.length) * OFFSET_WEIGHT;
  if (penalty > SUBSEQUENCE_MAX_PENALTY) return NO_MATCH_SCORE;
  const coverage = Math.min(1, query.length / target.length);
  const position =
    (penalty / SUBSEQUENCE_MAX_PENALTY) * PRIMARY_PENALTY_WEIGHT +
    (1 - coverage) * COVERAGE_WEIGHT;
  return (
    CONTIGUOUS_SCORE_CEILING +
    position * (SUBSEQUENCE_SCORE_CEILING - CONTIGUOUS_SCORE_CEILING)
  );
};

const startsAtWordBoundary = (char: string, target: string): boolean => {
  for (let i = 0; i < target.length; i++) {
    if (target[i] !== char) continue;
    if (i === 0 || WORD_BOUNDARY_CHARS.has(target[i - 1])) return true;
  }
  return false;
};

// Damerau-Levenshtein with a free skip over the target's prefix and suffix, so
// a short query can match inside a long name. The transposition case (the one
// reading `beforePrevious`, two error levels back) is why this tier exists: a
// plain subsequence scan already survives a dropped character, but not a
// swapped, substituted or doubled one.
const infixDamerauDistance = (query: string, target: string): number => {
  let beforePrevious: number[] = [];
  let previous = new Array<number>(target.length + 1).fill(0);
  for (let i = 1; i <= query.length; i++) {
    const row = new Array<number>(target.length + 1);
    row[0] = i;
    for (let j = 1; j <= target.length; j++) {
      const cost = query[i - 1] === target[j - 1] ? 0 : 1;
      let best = Math.min(
        previous[j] + 1,
        row[j - 1] + 1,
        previous[j - 1] + cost,
      );
      if (
        i > 1 &&
        j > 1 &&
        query[i - 1] === target[j - 2] &&
        query[i - 2] === target[j - 1]
      ) {
        best = Math.min(best, beforePrevious[j - 2] + 1);
      }
      row[j] = best;
    }
    beforePrevious = previous;
    previous = row;
  }
  return previous.reduce((min, value) => Math.min(min, value), Infinity);
};

const scoreFuzzy = (query: string, target: string): number => {
  if (query.length < FUZZY_MIN_QUERY_LENGTH) return NO_MATCH_SCORE;
  // Without this gate the tier is a noise machine: `todo` sits one
  // transposition from `tdoo` inside `outdoor.md`. Typists rarely fumble the
  // first character, so requiring it to open a word costs almost no recall.
  if (!startsAtWordBoundary(query[0], target)) return NO_MATCH_SCORE;
  const budget = Math.floor(query.length / FUZZY_CHARS_PER_ERROR);
  const errors = infixDamerauDistance(query, target);
  if (errors > budget) return NO_MATCH_SCORE;
  const coverage = Math.min(1, query.length / target.length);
  const position =
    (errors / budget) * PRIMARY_PENALTY_WEIGHT +
    (1 - coverage) * COVERAGE_WEIGHT;
  return (
    SUBSEQUENCE_SCORE_CEILING +
    position * (FUZZY_SCORE_CEILING - SUBSEQUENCE_SCORE_CEILING)
  );
};

const scoreCandidate = (query: string, target: string): number => {
  if (!query || !target) return NO_MATCH_SCORE;
  const index = target.indexOf(query);
  if (index !== NOT_FOUND) return scoreContiguous(query, target, index);
  const subsequence = scoreSubsequence(query, target);
  return subsequence === NO_MATCH_SCORE
    ? scoreFuzzy(query, target)
    : subsequence;
};

const searchFilenames = (
  files: FlatFile[],
  lowerQuery: string,
): DocsSearchResult[] =>
  files
    .map(file => ({
      file,
      score: Math.min(
        scoreCandidate(lowerQuery, file.name.toLowerCase()),
        scoreCandidate(lowerQuery, file.path.toLowerCase()),
      ),
    }))
    .filter(match => match.score !== NO_MATCH_SCORE)
    .map(match => ({
      name: match.file.name,
      path: match.file.path,
      matchType: 'filename' as const,
      score: match.score,
    }));

const fetchJson = async <T>(url: string, errorMessage: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(errorMessage);
  return res.json();
};

export const createDocsSnapshotSource = (baseUrl = ''): DocsSnapshotSource => {
  let treeCache: DocsNode[] | null = null;
  let flatFilesCache: FlatFile[] | null = null;
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

  const searchDocs = async (query: string): Promise<DocsSearchResult[]> => {
    if (!flatFilesCache) await fetchStructure();
    const files = flatFilesCache ?? [];
    const lowerQuery = query.toLowerCase();

    const filenameMatches = searchFilenames(files, lowerQuery);

    const filenameMatchPaths = new Set(filenameMatches.map(m => m.path));
    const contents = await fetchAllFileContents();
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
      .filter(f => f.index !== NOT_FOUND)
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
