import {
  CONTENT_TYPE_HEADER,
  FILE_ENTRY_KIND,
  JSON_CONTENT_TYPE,
  type FileEntry,
} from '@vigilant-broccoli/common-js';
import { FileExplorer } from '@vigilant-broccoli/file-explorer';

const LIST_ENDPOINT = '/sample-files/list';
const FILE_ENDPOINT = '/sample-files/file';
const MODIFIED = '2026-11-01T12:00:00.000Z';

const ENTRIES: Record<string, FileEntry[]> = {
  '': [
    {
      kind: FILE_ENTRY_KIND.FOLDER,
      name: 'Notes',
      path: 'Notes',
      modified: MODIFIED,
      created: MODIFIED,
      itemCount: 1,
    },
    {
      kind: FILE_ENTRY_KIND.FILE,
      name: 'readme.txt',
      path: 'readme.txt',
      modified: MODIFIED,
      created: MODIFIED,
      size: 42,
    },
  ],
  Notes: [
    {
      kind: FILE_ENTRY_KIND.FILE,
      name: 'todo.txt',
      path: 'Notes/todo.txt',
      modified: MODIFIED,
      created: MODIFIED,
      size: 18,
    },
  ],
};

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
  });

// Serves the sample tree from memory in place of the host app's endpoints.
const sampleFetcher: typeof fetch = async input => {
  const url = new URL(String(input), window.location.origin);
  const path = url.searchParams.get('path') ?? '';
  if (url.pathname === LIST_ENDPOINT)
    return jsonResponse({ entries: ENTRIES[path] ?? [] });
  return new Response(`Sample contents of ${path}`);
};

export const FileExplorerDemo = () => (
  <div className="h-96">
    <FileExplorer
      rootLabel="Sample files"
      listEndpoint={LIST_ENDPOINT}
      fileEndpoint={FILE_ENDPOINT}
      fetcher={sampleFetcher}
    />
  </div>
);
