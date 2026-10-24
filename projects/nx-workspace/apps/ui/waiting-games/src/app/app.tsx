import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { WaitingGames } from './components/WaitingGames';
import { I18nProvider } from './i18n';

const THEME_STORAGE_KEY = 'waiting-games-theme';

export function App() {
  return (
    <I18nProvider>
      <ThemeProvider storageKey={THEME_STORAGE_KEY}>
        <WaitingGames />
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
