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

export type UploadResult = {
  indexed: number;
  skipped: string[];
  failed: { name: string; error: string }[];
};

// Stores every file, then indexes the text-bearing ones. An indexing failure
// leaves the file stored and is reported per file instead of failing the upload.
export const uploadKnowledgeFiles = async (folder: string, files: File[]) => {
  await uploadCmsFiles(toKey(folder), files);
  const result: UploadResult = { indexed: 0, skipped: [], failed: [] };
  for (const file of files) {
    if (!isIndexable(file.name)) {
      result.skipped.push(file.name);
      continue;
    }
    try {
      await indexKnowledgeFile(
        `${toKey(folder)}${KEY_SEPARATOR}${file.name}`,
        file,
      );
      result.indexed += 1;
    } catch (error) {
      result.failed.push({
        name: file.name,
        error: error instanceof Error ? error.message : 'Failed to index file',
      });
    }
  }
  return result;
};

export const deleteKnowledgeFile = async (path: string) => {
  await deleteCmsFile(toKey(path));
  await deleteKnowledgeChunks(toKey(path));
};
