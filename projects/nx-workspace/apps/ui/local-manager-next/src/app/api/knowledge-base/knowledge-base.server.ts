import {
  KNOWLEDGE_BASE_PREFIX,
  deleteKnowledgeChunks,
  indexKnowledgeFile,
  isIndexable,
} from '../../../lib/knowledge-base';
import {
  deleteCmsFile,
  listCmsEntries,
  uploadCmsFiles,
} from '../cms/cms.server';

const KEY_SEPARATOR = '/';

// The page works in paths relative to the `knowledge-base/` prefix; bucket
// keys always carry it.
export const toKey = (path: string) =>
  path
    ? `${KNOWLEDGE_BASE_PREFIX}${KEY_SEPARATOR}${path}`
    : KNOWLEDGE_BASE_PREFIX;

export const listKnowledgeEntries = async (folder: string) =>
  (await listCmsEntries(toKey(folder))).map(entry => ({
    ...entry,
    path: entry.path.slice(KNOWLEDGE_BASE_PREFIX.length + KEY_SEPARATOR.length),
  }));

export const INDEX_STATUS = {
  INDEXING: 'indexing',
  INDEXED: 'indexed',
  FAILED: 'failed',
} as const;

export type IndexStatus = {
  path: string;
  status: (typeof INDEX_STATUS)[keyof typeof INDEX_STATUS];
  error?: string;
};

export type UploadResult = {
  queued: number;
  skipped: string[];
};

// Held on globalThis so Next's per-route module instances share one registry.
// Statuses live in memory only: a restart forgets them, and the files stay stored.
const globalForIndex = globalThis as typeof globalThis & {
  knowledgeIndexStatuses?: Map<string, IndexStatus>;
  knowledgeIndexQueue?: Promise<void>;
};
const statuses = (globalForIndex.knowledgeIndexStatuses ??= new Map());

export const listIndexStatuses = () => [...statuses.values()];

const setStatus = (key: string, status: Omit<IndexStatus, 'path'>) =>
  statuses.set(key, {
    path: key.slice(KNOWLEDGE_BASE_PREFIX.length + KEY_SEPARATOR.length),
    ...status,
  });

// Files are indexed one at a time so a large folder drop does not run several
// OCR and embedding jobs at once.
const enqueueIndex = (key: string, file: File) => {
  setStatus(key, { status: INDEX_STATUS.INDEXING });
  globalForIndex.knowledgeIndexQueue = (
    globalForIndex.knowledgeIndexQueue ?? Promise.resolve()
  ).then(async () => {
    // Deleted while waiting in the queue.
    if (!statuses.has(key)) return;
    try {
      await indexKnowledgeFile(key, file);
      if (statuses.has(key)) setStatus(key, { status: INDEX_STATUS.INDEXED });
    } catch (error) {
      if (statuses.has(key))
        setStatus(key, {
          status: INDEX_STATUS.FAILED,
          error:
            error instanceof Error ? error.message : 'Failed to index file',
        });
    }
  });
};

// Stores every file, then queues the text-bearing ones for background indexing
// so the request returns without waiting on OCR or embeddings.
export const uploadKnowledgeFiles = async (folder: string, files: File[]) => {
  await uploadCmsFiles(toKey(folder), files);
  const result: UploadResult = { queued: 0, skipped: [] };
  for (const file of files) {
    if (!isIndexable(file.name)) {
      result.skipped.push(file.name);
      continue;
    }
    enqueueIndex(`${toKey(folder)}${KEY_SEPARATOR}${file.name}`, file);
    result.queued += 1;
  }
  return result;
};

export const deleteKnowledgeFile = async (path: string) => {
  statuses.delete(toKey(path));
  await deleteCmsFile(toKey(path));
  await deleteKnowledgeChunks(toKey(path));
};
