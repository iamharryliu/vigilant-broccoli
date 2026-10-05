import { ComponentSandbox } from '@vigilant-broccoli/react-sandbox';

const SITE_NAME = 'Component Library';

export function App() {
  return <ComponentSandbox wrapInTheme siteName={SITE_NAME} />;
}

export default App;
