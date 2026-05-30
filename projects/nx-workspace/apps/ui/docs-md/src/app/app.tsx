import { useMemo } from 'react';
import { Theme } from '@radix-ui/themes';
import { DocsViewer, FILE_PARAM } from '@vigilant-broccoli/react-utility';
import { fetchStructure, fetchContent, searchDocs } from './github-docs';

const getFileParam = () =>
  new URLSearchParams(window.location.search).get(FILE_PARAM);

const setFileParam = (path: string) => {
  const params = new URLSearchParams(window.location.search);
  params.set(FILE_PARAM, path);
  window.history.pushState(null, '', `?${params.toString()}`);
};

export function App() {
  const urlSync = useMemo(() => ({ get: getFileParam, set: setFileParam }), []);

  return (
    <Theme>
      <div className="h-screen p-4 bg-white dark:bg-gray-900">
        <DocsViewer
          getStructure={fetchStructure}
          getContent={fetchContent}
          search={searchDocs}
          urlSync={urlSync}
        />
      </div>
    </Theme>
  );
}

export default App;
