import { ThemeProvider, useDocumentTitle } from '@vigilant-broccoli/react-lib';
import {
  createDocsSnapshotSource,
  createSearchParamUrlSync,
  DocsExplorer,
  MarkdownViewer,
  type DocsNode,
} from '@vigilant-broccoli/docs-explorer';
import { useEffect, useState } from 'react';
import { renderSolutions } from './solutions-view';

const THEME_STORAGE_KEY = 'grind-75-react-theme';
const SITE_NAME = 'Grind 75';
const PAGE_TITLE = 'Solutions';

const { fetchStructure, fetchContent, searchDocs } = createDocsSnapshotSource();

const urlSync = createSearchParamUrlSync();

// Problems live under a category folder; root-level files are markdown notes.
const renderContent = (
  content: string,
  navigate: (path: string) => void,
  sourcePaths: string[],
) =>
  sourcePaths.length === 1 && !sourcePaths[0].includes('/') ? (
    <MarkdownViewer
      content={content}
      filePath={sourcePaths[0]}
      onNavigate={navigate}
    />
  ) : (
    renderSolutions(content)
  );

export function App() {
  useDocumentTitle(`${PAGE_TITLE} | ${SITE_NAME}`);
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
            renderContent={renderContent}
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
