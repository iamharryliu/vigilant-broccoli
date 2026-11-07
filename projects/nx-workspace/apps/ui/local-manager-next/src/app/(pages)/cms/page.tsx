'use client';

import { FileEntry, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { FileExplorer } from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import { authFetch } from '../../../../libs/auth';
import { SIDEBAR_ROUTE } from '../../app.const';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { usePageTitle } from '../../use-page-title';

const ROOT_LABEL = 'R2';
const FILES_FIELD = 'files';

const withPath = (path: string) =>
  `${API_ENDPOINTS.CMS}?path=${encodeURIComponent(path)}`;

const assertOk = async (response: Response) => {
  if (!response.ok) throw new Error((await response.json()).error);
};

const uploadFiles = async (folderPath: string, files: File[]) => {
  const body = new FormData();
  files.forEach(file => body.append(FILES_FIELD, file));
  await assertOk(
    await authFetch(withPath(folderPath), { method: HTTP_METHOD.POST, body }),
  );
  toast.success(`Uploaded ${files.length} file(s)`);
};

const deleteFile = async (entry: FileEntry) => {
  await assertOk(
    await authFetch(withPath(entry.path), { method: HTTP_METHOD.DELETE }),
  );
  toast.success(`Deleted ${entry.name}`);
};

export default function Page() {
  usePageTitle(SIDEBAR_ROUTE.CMS.title);
  return (
    // Cancels the layout's `main` p-4 so the explorer fills the content area edge to edge.
    <div className="-m-4 h-[calc(100%+2rem)]">
      <FileExplorer
        rootLabel={ROOT_LABEL}
        listEndpoint={API_ENDPOINTS.CMS}
        fileEndpoint={API_ENDPOINTS.CMS_FILE}
        fetcher={authFetch}
        onError={toast.error}
        onUpload={uploadFiles}
        onDelete={deleteFile}
      />
    </div>
  );
}
