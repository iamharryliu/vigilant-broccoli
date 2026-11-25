import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { I18nProvider } from './i18n';
import { NotepadPage } from './NotepadPage';

const THEME_STORAGE_KEY = 'notepad-react-theme';

export const App = () => (
  <ThemeProvider storageKey={THEME_STORAGE_KEY}>
    <I18nProvider>
      <main className="w-full p-4">
        <NotepadPage />
      </main>
    </I18nProvider>
  </ThemeProvider>
);

export default App;
