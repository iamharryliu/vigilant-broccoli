import { basename } from 'path';
import {
  KNOWLEDGE_BASE_PREFIX,
  deleteKnowledgeChunks,
  indexKnowledgeFile,
  isIndexable,
} from '../../../lib/knowledge-base';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import {
  deleteCmsFile,
  listCmsEntries,
  readCmsFile,
  uploadCmsFiles,
} from '../cms/cms.server';

const KEY_SEPARATOR = '/';
const FILES_TABLE = 'knowledge_files';

// The page works in paths relative to the `knowledge-base/` prefix; bucket
// keys always carry it.
export const toKey = (path: string) =>
  path
    ? `${KNOWLEDGE_BASE_PREFIX}${KEY_SEPARATOR}${path}`
    : KNOWLEDGE_BASE_PREFIX;

const toPath = (key: string) =>
  key.slice(KNOWLEDGE_BASE_PREFIX.length + KEY_SEPARATOR.length);

export const listKnowledgeEntries = async (folder: string) =>
  (await listCmsEntries(toKey(folder))).map(entry => ({
    ...entry,
    path: toPath(entry.path),
  }));

export const INDEX_STATUS = {
  INDEXING: 'indexing',
  INDEXED: 'indexed',
  FAILED: 'failed',
} as const;

type IndexStatusValue = (typeof INDEX_STATUS)[keyof typeof INDEX_STATUS];

export type IndexStatus = {
  path: string;
  status: IndexStatusValue;
  error?: string;
};

type FileRow = {
  file_key: string;
  status: IndexStatusValue;
  error: string | null;
};

export type UploadResult = {
  queued: number;
  skipped: string[];
};

const throwOnError = ({ error }: { error: { message: string } | null }) => {
  if (error) throw new Error(error.message);
};

const markIndexing = async (keys: string[]) =>
  throwOnError(
    await supabaseAdmin.from(FILES_TABLE).upsert(
      keys.map(file_key => ({
        file_key,
        status: INDEX_STATUS.INDEXING,
        error: null,
        updated_at: new Date().toISOString(),
      })),
    ),
  );

// An update, not an upsert, so a file deleted mid-index is not brought back.
const markDone = async (key: string, error?: string) =>
  throwOnError(
    await supabaseAdmin
      .from(FILES_TABLE)
      .update({
        status: error ? INDEX_STATUS.FAILED : INDEX_STATUS.INDEXED,
        error: error ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('file_key', key),
  );

// Held on globalThis so Next's per-route module instances share one queue.
const globalForIndex = globalThis as typeof globalThis & {
  knowledgeIndexQueue?: Promise<void>;
  knowledgeIndexResumed?: boolean;
};

// The worker reads the bytes back from R2 so a queued key needs no in-memory
// File and can be resumed after a restart. Files are indexed one at a time so
// a large folder drop does not run several OCR and embedding jobs at once.
const enqueueIndex = (key: string) => {
  globalForIndex.knowledgeIndexQueue = (
    globalForIndex.knowledgeIndexQueue ?? Promise.resolve()
  ).then(async () => {
    try {
      const file = new File([await readCmsFile(key)], basename(key));
      await indexKnowledgeFile(key, file);
      await markDone(key);
    } catch (error) {
      await markDone(
        key,
        error instanceof Error ? error.message : 'Failed to index file',
      ).catch(() => undefined);
    }
  });
};

const listRows = async () => {
  const { data, error } = await supabaseAdmin
    .from(FILES_TABLE)
    .select('file_key, status, error');
  if (error) throw new Error(error.message);
  return data as FileRow[];
};

// Rows still 'indexing' on the first status read of this process were left by
// one that stopped mid-queue.
const resumeInterruptedIndexing = (rows: FileRow[]) => {
  if (globalForIndex.knowledgeIndexResumed) return;
  globalForIndex.knowledgeIndexResumed = true;
  rows
    .filter(row => row.status === INDEX_STATUS.INDEXING)
    .forEach(row => enqueueIndex(row.file_key));
};

export const listIndexStatuses = async (): Promise<IndexStatus[]> => {
  const rows = await listRows();
  resumeInterruptedIndexing(rows);
  return rows.map(row => ({
    path: toPath(row.file_key),
    status: row.status,
    ...(row.error ? { error: row.error } : {}),
  }));
};

// Stores every file, then queues the text-bearing ones for background indexing
// so the request returns without waiting on OCR or embeddings.
export const uploadKnowledgeFiles = async (folder: string, files: File[]) => {
  await uploadCmsFiles(toKey(folder), files);
  const indexable = files.filter(file => isIndexable(file.name));
  const keys = indexable.map(
    file => `${toKey(folder)}${KEY_SEPARATOR}${file.name}`,
  );
  if (keys.length > 0) await markIndexing(keys);
  keys.forEach(enqueueIndex);
  return {
    queued: keys.length,
    skipped: files
      .filter(file => !isIndexable(file.name))
      .map(file => file.name),
  } satisfies UploadResult;
};

export const deleteKnowledgeFile = async (path: string) => {
  const key = toKey(path);
  await deleteCmsFile(key);
  throwOnError(
    await supabaseAdmin.from(FILES_TABLE).delete().eq('file_key', key),
  );
  await deleteKnowledgeChunks(key);
};
