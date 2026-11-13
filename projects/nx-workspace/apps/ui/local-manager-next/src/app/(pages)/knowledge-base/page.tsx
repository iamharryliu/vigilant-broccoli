'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { FileEntry, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { FileExplorer } from '@vigilant-broccoli/file-explorer';
import { Text } from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { authFetch } from '../../../../libs/auth';
import { SIDEBAR_ROUTE } from '../../app.const';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { usePageTitle } from '../../use-page-title';

const ROOT_LABEL = 'Knowledge Base';
const FILES_FIELD = 'files';
const STATUS_POLL_MS = 2000;
const STATUS_INDEXING = 'indexing';
const STATUS_INDEXED = 'indexed';
const STATUS_FAILED = 'failed';
const STATUS_ICON_SIZE = 14;
const INDEXED_LABEL = 'Indexed for chat';
const INDEXING_LABEL = 'Indexing';

type UploadResult = {
  queued: number;
  skipped: string[];
};

type IndexStatus = {
  path: string;
  status: 'indexing' | 'indexed' | 'failed';
  error?: string;
};

const withPath = (path: string) =>
  `${API_ENDPOINTS.KNOWLEDGE_BASE}?path=${encodeURIComponent(path)}`;

const assertOk = async (response: Response) => {
  if (!response.ok) throw new Error((await response.json()).error);
};

const deleteFile = async (entry: FileEntry) => {
  await assertOk(
    await authFetch(withPath(entry.path), { method: HTTP_METHOD.DELETE }),
  );
  toast.success(`Deleted ${entry.name}`);
};

const fetchStatuses = async (): Promise<IndexStatus[]> => {
  const response = await authFetch(API_ENDPOINTS.KNOWLEDGE_BASE_STATUS);
  if (!response.ok) return [];
  return (await response.json()).statuses;
};

const IndexStatusBadge = ({ status }: { status?: IndexStatus }) => {
  if (status?.status === STATUS_INDEXING)
    return (
      <Loader2
        size={STATUS_ICON_SIZE}
        className="shrink-0 animate-spin text-gray-400 dark:text-gray-500"
        aria-label={INDEXING_LABEL}
      >
        <title>{INDEXING_LABEL}</title>
      </Loader2>
    );
  if (status?.status === STATUS_FAILED)
    return (
      <AlertCircle
        size={STATUS_ICON_SIZE}
        className="shrink-0 text-red-500"
        aria-label={status.error}
      >
        <title>{status.error}</title>
      </AlertCircle>
    );
  if (status?.status === STATUS_INDEXED)
    return (
      <CheckCircle2
        size={STATUS_ICON_SIZE}
        className="shrink-0 text-green-500"
        aria-label={INDEXED_LABEL}
      >
        <title>{INDEXED_LABEL}</title>
      </CheckCircle2>
    );
  return null;
};

const IndexStatusBar = ({ statuses }: { statuses: IndexStatus[] }) => {
  const indexing = statuses.filter(s => s.status === STATUS_INDEXING);
  const failed = statuses.filter(s => s.status === STATUS_FAILED);
  if (indexing.length === 0 && failed.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 border-b px-4 py-2">
      {indexing.length > 0 && (
        <div className="flex items-center gap-2">
          <Loader2 size={STATUS_ICON_SIZE} className="animate-spin" />
          <Text size="2">
            Indexing {indexing.length} file(s):{' '}
            {indexing.map(s => s.path).join(', ')}
          </Text>
        </div>
      )}
      {failed.map(s => (
        <Text key={s.path} size="2" color="red">
          Indexing failed for {s.path}: {s.error}
        </Text>
      ))}
    </div>
  );
};

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.KNOWLEDGE_BASE.title);
  const [statuses, setStatuses] = useState<IndexStatus[]>([]);
  const [pollTick, setPollTick] = useState(0);
  const hasIndexing = statuses.some(s => s.status === STATUS_INDEXING);
  const wasIndexingRef = useRef(false);
  const statusByPath = new Map(statuses.map(s => [s.path, s]));

  useEffect(() => {
    let cancelled = false;
    fetchStatuses().then(next => {
      if (cancelled) return;
      setStatuses(next);
      if (
        wasIndexingRef.current &&
        !next.some(s => s.status === STATUS_INDEXING)
      ) {
        toast.success('Indexing finished');
      }
      wasIndexingRef.current = next.some(s => s.status === STATUS_INDEXING);
    });
    return () => {
      cancelled = true;
    };
  }, [pollTick]);

  useEffect(() => {
    if (!hasIndexing) return;
    const timer = setTimeout(
      () => setPollTick(tick => tick + 1),
      STATUS_POLL_MS,
    );
    return () => clearTimeout(timer);
  }, [hasIndexing, pollTick]);

  const uploadFiles = async (folderPath: string, files: File[]) => {
    const body = new FormData();
    files.forEach(file => body.append(FILES_FIELD, file));
    const response = await authFetch(withPath(folderPath), {
      method: HTTP_METHOD.POST,
      body,
    });
    await assertOk(response);
    const { queued, skipped }: UploadResult = await response.json();
    toast.success(
      `Uploaded ${files.length} file(s), indexing ${queued} in the background` +
        (skipped.length > 0 ? `, ${skipped.length} not indexable` : ''),
    );
    setPollTick(tick => tick + 1);
  };

  return (
    // Cancels the layout's `main` p-4 so the explorer fills the content area edge to edge.
    <div className="-m-4 flex h-[calc(100%+2rem)] flex-col">
      <IndexStatusBar statuses={statuses} />
      <div className="min-h-0 flex-1">
        <FileExplorer
          rootLabel={ROOT_LABEL}
          listEndpoint={API_ENDPOINTS.KNOWLEDGE_BASE}
          fileEndpoint={API_ENDPOINTS.KNOWLEDGE_BASE_FILE}
          fetcher={authFetch}
          onError={toast.error}
          onUpload={uploadFiles}
          onDelete={deleteFile}
          renderEntryBadge={entry => (
            <IndexStatusBadge status={statusByPath.get(entry.path)} />
          )}
        />
      </div>
    </div>
  );
}
