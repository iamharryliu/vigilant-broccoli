import { ThemeProvider, useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { Pastebin } from '@vigilant-broccoli/react-lib-higher-level';
import { PASTEBIN_GROUPS } from '@vigilant-broccoli/public-links';

const PAGE_TITLE = 'Links';
const SEARCH_PLACEHOLDER = 'Search links...';

export function App() {
  useDocumentTitle(PAGE_TITLE);

  return (
    <ThemeProvider>
      <div className="h-dvh bg-white p-2 dark:bg-gray-900 sm:p-4">
        <div className="mx-auto h-full max-w-2xl">
          <Pastebin
            groups={PASTEBIN_GROUPS}
            searchPlaceholder={SEARCH_PLACEHOLDER}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
