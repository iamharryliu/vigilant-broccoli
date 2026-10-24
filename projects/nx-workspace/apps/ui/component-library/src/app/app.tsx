import { ComponentSandbox } from '@vigilant-broccoli/react-sandbox';

const SITE_NAME = 'Component Library';
const THEME_STORAGE_KEY = 'component-library-theme';

export function App() {
  return (
    <ComponentSandbox
      wrapInTheme
      themeStorageKey={THEME_STORAGE_KEY}
      siteName={SITE_NAME}
    />
  );
}

export default App;
