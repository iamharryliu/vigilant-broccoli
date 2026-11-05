import { useMemo } from 'react';
import { ThemeProvider, useDocumentTitle } from '@vigilant-broccoli/react-lib';
import {
  createDocsSnapshotSource,
  DocsExplorer,
  FILE_PARAM,
  type DocsNode,
} from '@vigilant-broccoli/react-lib-higher-level';
import { useEffect, useState } from 'react';
import { renderSolutions } from './solutions-view';

const THEME_STORAGE_KEY = 'grind-75-react-theme';
const SITE_NAME = 'Grind 75';
const PAGE_TITLE = 'Solutions';

const { fetchStructure, fetchContent, searchDocs } = createDocsSnapshotSource();

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
  useDocumentTitle(`${PAGE_TITLE} | ${SITE_NAME}`);
  const urlSync = useMemo(() => ({ get: getFileParam, set: setFileParam }), []);
  const [nodes, setNodes] = useState<DocsNode[] | null>(null);

  useEffect(() => {
    fetchStructure().then(setNodes);
  }, []);

  return (
    <ThemeProvider storageKey={THEME_STORAGE_KEY}>
      <div className="h-dvh p-2 sm:p-4 bg-white dark:bg-gray-900">
        {nodes && (
          <DocsExplorer
            nodes={nodes}
            getContent={fetchContent}
            renderContent={renderSolutions}
            search={searchDocs}
            urlSync={urlSync}
            sidebarTitle={SITE_NAME}
            searchPlaceholder="Search problems and code"
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
