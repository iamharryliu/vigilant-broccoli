import {
  API_KEY_HEADER,
  FILE_ENTRY_KIND,
  FileEntry,
  HTTP_METHOD,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { BucketProvider } from '@vigilant-broccoli/storage';
import { getVbExpressApiKey } from '../../../lib/vb-express';

export const PATH_PARAM = 'path';
export const FILES_FIELD = 'files';

// bucket-service picks its default CLOUDFLARE_BUCKET_NAME when no bucketName
// is sent; never send one (TODO 1458c6).
const PROVIDER = BucketProvider.CLOUDFLARE_R2;
const PROVIDER_PARAM = 'provider';
const FILE_NAME_PARAM = 'fileName';
const FOLDER_PARAM = 'folder';
const KEY_SEPARATOR = '/';
const PARENT_SEGMENT = '..';
const UNKNOWN_TIMESTAMP = new Date(0).toISOString();

const STORAGE_PATH = {
  FILES: 'files',
  FILE: 'file',
} as const;

type BucketFileJson = { name: string; size?: number; updatedAt?: string };

const storageUrl = (
  path: (typeof STORAGE_PATH)[keyof typeof STORAGE_PATH],
  params: Record<string, string> = {},
) =>
  `${getEnvironmentVariable('VB_EXPRESS_URL')}/api/storage/${path}?${new URLSearchParams(
    { [PROVIDER_PARAM]: PROVIDER, ...params },
  )}`;

const apiHeaders = () => ({ [API_KEY_HEADER]: getVbExpressApiKey() });

// '' is the bucket root; anything else must be slash-separated segments with
// no leading slash, empty segment or `..`.
export const isValidCmsPath = (path: string) =>
  path === '' ||
  path
    .split(KEY_SEPARATOR)
    .every(segment => segment !== '' && segment !== PARENT_SEGMENT);

const errorFrom = async (response: Response, fallback: string) => {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return new Error(body?.error ?? `${fallback}: ${response.status}`);
};

type FolderSummary = {
  children: Set<string>;
  modified: string;
  created: string;
};

const addToFolder = (
  folder: FolderSummary | undefined,
  child: string,
  isNested: boolean,
  timestamp: string,
): FolderSummary => {
  const summary = folder ?? {
    children: new Set<string>(),
    modified: timestamp,
    created: timestamp,
  };
  // An empty child is the folder's own `name/` placeholder object. The
  // trailing separator keeps a subfolder distinct from a same-named file.
  if (child)
    summary.children.add(isNested ? `${child}${KEY_SEPARATOR}` : child);
  if (timestamp > summary.modified) summary.modified = timestamp;
  if (timestamp < summary.created) summary.created = timestamp;
  return summary;
};

// R2 keys are flat, so the folder view is derived from key prefixes: direct
// files become file entries and each next path segment becomes a folder.
const toEntries = (files: BucketFileJson[], folder: string): FileEntry[] => {
  const prefix = folder ? `${folder}${KEY_SEPARATOR}` : '';
  const fileEntries: FileEntry[] = [];
  const folders = new Map<string, FolderSummary>();

  for (const file of files) {
    if (!file.name.startsWith(prefix)) continue;
    const [name, child, ...descendants] = file.name
      .slice(prefix.length)
      .split(KEY_SEPARATOR);
    // Skips the open folder's own placeholder object.
    if (!name) continue;
    const timestamp = file.updatedAt ?? UNKNOWN_TIMESTAMP;

    if (child === undefined) {
      fileEntries.push({
        kind: FILE_ENTRY_KIND.FILE,
        name,
        path: `${prefix}${name}`,
        modified: timestamp,
        created: timestamp,
        size: file.size ?? 0,
      });
    } else {
      folders.set(
        name,
        addToFolder(
          folders.get(name),
          child,
          descendants.length > 0,
          timestamp,
        ),
      );
    }
  }

  const folderEntries: FileEntry[] = [...folders].map(([name, summary]) => ({
    kind: FILE_ENTRY_KIND.FOLDER,
    name,
    path: `${prefix}${name}`,
    modified: summary.modified,
    created: summary.created,
    itemCount: summary.children.size,
  }));
  return [...folderEntries, ...fileEntries];
};

export const listCmsEntries = async (folder: string) => {
  const response = await fetch(storageUrl(STORAGE_PATH.FILES), {
    headers: apiHeaders(),
  });
  if (!response.ok) throw await errorFrom(response, 'Failed to list bucket');
  return toEntries((await response.json()) as BucketFileJson[], folder);
};

export const readCmsFile = async (key: string) => {
  const response = await fetch(
    storageUrl(STORAGE_PATH.FILE, { [FILE_NAME_PARAM]: key }),
    { headers: apiHeaders() },
  );
  if (!response.ok) throw await errorFrom(response, 'Failed to read file');
  return response.arrayBuffer();
};

export const uploadCmsFiles = async (folder: string, files: File[]) => {
  const body = new FormData();
  files.forEach(file => body.append(FILES_FIELD, file));
  const response = await fetch(
    storageUrl(STORAGE_PATH.FILES, folder ? { [FOLDER_PARAM]: folder } : {}),
    { method: HTTP_METHOD.POST, headers: apiHeaders(), body },
  );
  if (!response.ok) throw await errorFrom(response, 'Failed to upload files');
  return response.json();
};

export const deleteCmsFile = async (key: string) => {
  const response = await fetch(
    storageUrl(STORAGE_PATH.FILE, { [FILE_NAME_PARAM]: key }),
    { method: HTTP_METHOD.DELETE, headers: apiHeaders() },
  );
  if (!response.ok) throw await errorFrom(response, 'Failed to delete file');
};
