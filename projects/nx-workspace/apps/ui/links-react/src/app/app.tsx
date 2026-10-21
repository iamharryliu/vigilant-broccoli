import { ThemeProvider, useDocumentTitle } from '@vigilant-broccoli/react-lib';
import { QuickLinksPanel } from '@vigilant-broccoli/react-lib-higher-level';
import { PASTEBIN_LINKS } from '@vigilant-broccoli/public-links';

const PAGE_TITLE = 'Links';

export function App() {
  useDocumentTitle(PAGE_TITLE);

  return (
    <ThemeProvider>
      <div className="h-dvh bg-white p-2 dark:bg-gray-900 sm:p-4">
        <div className="mx-auto h-full max-w-2xl">
          <QuickLinksPanel links={PASTEBIN_LINKS} preserveOrder />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
