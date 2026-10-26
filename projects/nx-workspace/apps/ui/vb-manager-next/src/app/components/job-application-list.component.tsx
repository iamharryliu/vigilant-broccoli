'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, Loader2 } from 'lucide-react';
import { FILE_ENTRY_KIND, FileEntry } from '@vigilant-broccoli/common-js';
import {
  CollapsibleList,
  CollapsibleListItemConfig,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  isCopyableFile,
  isPostingFile,
  openJobApplicationFile,
  parseApplicationFolder,
  readJobApplicationText,
} from '../utils/job-application-files.utils';

const ACTION_BUTTON_CLASS_NAME =
  'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';
const NO_POSTING_TEXT = 'No posting saved for this application.';

const listFolder = async (path: string): Promise<FileEntry[]> => {
  const response = await authFetch(
    `${API_ENDPOINTS.JOB_APPLICATIONS}?path=${encodeURIComponent(path)}`,
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.entries;
};

const reportError = (error: unknown, fallback: string) =>
  toast.error(error instanceof Error ? error.message : fallback);

const copyText = async (path: string) => {
  try {
    await navigator.clipboard.writeText(await readJobApplicationText(path));
    toast.success('Copied');
  } catch (error) {
    reportError(error, 'Failed to copy file');
  }
};

const viewFile = async (path: string) => {
  try {
    await openJobApplicationFile(path);
  } catch (error) {
    reportError(error, 'Failed to open file');
  }
};

const FileActions = ({ file }: { file: FileEntry }) => (
  <div className="flex items-center gap-1">
    <button
      type="button"
      onClick={() => viewFile(file.path)}
      className={ACTION_BUTTON_CLASS_NAME}
    >
      <ExternalLink size={12} /> View
    </button>
    {isCopyableFile(file.name) && (
      <button
        type="button"
        onClick={() => copyText(file.path)}
        className={ACTION_BUTTON_CLASS_NAME}
      >
        <Copy size={12} /> Copy
      </button>
    )}
  </div>
);

// Mounted by the accordion only while open, so a folder is read on expand.
const ApplicationContent = ({ folder }: { folder: string }) => {
  const [files, setFiles] = useState<FileEntry[] | null>(null);
  const [posting, setPosting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const entries = (await listFolder(folder)).filter(
          entry => entry.kind === FILE_ENTRY_KIND.FILE,
        );
        const postingFile = entries.find(entry => isPostingFile(entry.name));
        const text = postingFile
          ? await readJobApplicationText(postingFile.path)
          : '';
        if (cancelled) return;
        setFiles(entries);
        setPosting(text);
      } catch (error) {
        reportError(error, 'Failed to load application');
        if (!cancelled) setFiles([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [folder]);

  if (!files) return <Loader2 size={14} className="animate-spin" />;

  return (
    <div className="flex flex-col gap-4 px-1">
      <section className="flex flex-col gap-1">
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Job posting
        </h3>
        {posting ? (
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs dark:bg-gray-900">
            {posting}
          </pre>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {NO_POSTING_TEXT}
          </p>
        )}
      </section>
      <section className="flex flex-col gap-1">
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Files
        </h3>
        {files.map(file => (
          <div key={file.path} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-xs">{file.name}</span>
            <FileActions file={file} />
          </div>
        ))}
      </section>
    </div>
  );
};

export const JobApplicationList = () => {
  const [folders, setFolders] = useState<FileEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const entries = await listFolder('');
      setFolders(
        entries.filter(entry => entry.kind === FILE_ENTRY_KIND.FOLDER),
      );
    } catch (error) {
      reportError(error, 'Failed to load job applications');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const items = useMemo<CollapsibleListItemConfig[]>(
    () =>
      folders
        .map(folder => ({
          folder,
          ...parseApplicationFolder(
            folder.name,
            folder.modified,
            folder.created,
          ),
        }))
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            b.folder.created.localeCompare(a.folder.created),
        )
        .map(({ folder, title }) => ({
          id: folder.path,
          title,
          content: <ApplicationContent folder={folder.path} />,
        })),
    [folders],
  );

  if (loaded && !items.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No job applications yet.
      </p>
    );
  }
  return <CollapsibleList items={items} />;
};
