import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { WaitingGames } from './components/WaitingGames';
import { I18nProvider } from './i18n';

export function App() {
  return (
    <I18nProvider>
      <ThemeProvider followSystem>
        <WaitingGames />
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
