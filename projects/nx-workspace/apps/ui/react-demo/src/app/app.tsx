import { Theme } from '@radix-ui/themes';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { APP_ROUTE } from './app.consts';

export function App() {
  return (
    <Theme>
      <BrowserRouter>
        <Routes>
          {Object.values(APP_ROUTE).map(
            ({ path, component: Component }, idx) => (
              <Route key={idx} path={path} element={<Component />} />
            ),
          )}
        </Routes>
      </BrowserRouter>
    </Theme>
  );
}

export default App;
