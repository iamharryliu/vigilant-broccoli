import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { TextToolsPage } from './TextToolsPage';

const THEME_STORAGE_KEY = 'text-tools-ui-theme';

export const App = () => (
  <ThemeProvider storageKey={THEME_STORAGE_KEY}>
    <main className="w-full p-4">
      <TextToolsPage />
    </main>
  </ThemeProvider>
);

export default App;
