import { useMemo } from 'react';
import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import {
  createDocsSnapshotSource,
  DocsViewer,
  FILE_PARAM,
} from '@vigilant-broccoli/react-utility';

const { fetchStructure, fetchContent, fetchGraph, searchDocs } =
  createDocsSnapshotSource();

const getFileParam = () =>
  new URLSearchParams(window.location.search).get(FILE_PARAM);

const setFileParam = (path: string) => {
  const params = new URLSearchParams(window.location.search);
  params.set(FILE_PARAM, path);
  window.history.pushState(
    null,
    '',
    `?${params.toString()}${window.location.hash}`,
  );
};

export function App() {
  const urlSync = useMemo(() => ({ get: getFileParam, set: setFileParam }), []);

  return (
    <ThemeProvider>
      <div className="h-dvh p-2 sm:p-4 bg-white dark:bg-gray-900">
        <DocsViewer
          getStructure={fetchStructure}
          getContent={fetchContent}
          search={searchDocs}
          getGraph={fetchGraph}
          urlSync={urlSync}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
