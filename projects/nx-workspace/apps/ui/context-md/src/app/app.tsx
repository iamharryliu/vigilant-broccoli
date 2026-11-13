import { ThemeProvider, useDocumentTitle } from '@vigilant-broccoli/react-lib';
import {
  createDocsSnapshotSource,
  createSearchParamUrlSync,
  DocsViewer,
} from '@vigilant-broccoli/docs-explorer';

const THEME_STORAGE_KEY = 'context-md-theme';
const SITE_NAME = 'Agent Context';
const PAGE_TITLE = 'Browse';

const { fetchStructure, fetchContent, fetchGraph, searchDocs } =
  createDocsSnapshotSource();

const urlSync = createSearchParamUrlSync();

export function App() {
  useDocumentTitle(`${PAGE_TITLE} | ${SITE_NAME}`);

  return (
    <ThemeProvider storageKey={THEME_STORAGE_KEY}>
      <div className="h-dvh p-2 sm:p-4 bg-white dark:bg-gray-900">
        <DocsViewer
          siteName={SITE_NAME}
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
