import { Theme } from '@radix-ui/themes';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ComponentLibraryDemo } from './components/pages/DemoPage';
import { APP_ROUTE } from './app.consts';
import { IndexPage } from './components/pages/IndexPage';
import { CharacterCounterPage } from './components/pages/CharacterCountPage';
import { JSONPage } from './components/pages/JSONPage';

export function App() {
  return (
    <Theme>
      <BrowserRouter>
        <Routes>
          <Route path={APP_ROUTE.INDEX.path} element={<IndexPage />} />
          <Route path={APP_ROUTE.JSON.path} element={<JSONPage />} />
          <Route
            path={APP_ROUTE.TEXT.path}
            element={<CharacterCounterPage />}
          />
          <Route
            path={APP_ROUTE.COMPONENT_LIBRARY.path}
            element={<ComponentLibraryDemo />}
          />
        </Routes>
      </BrowserRouter>
    </Theme>
  );
}

export default App;
