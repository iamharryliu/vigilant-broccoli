import { HashRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider } from './i18n';
import { HomePage } from './pages/HomePage';
import { UiPage } from './pages/UiPage';
import { StatusPage } from './pages/StatusPage';
import { OpenSourcePage } from './pages/OpenSourcePage';
import { ApiServicesPage } from './pages/ApiServicesPage';
import { ApiDocsPage } from './pages/ApiDocsPage';

export function App() {
  return (
    <I18nProvider>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <HashRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ui" element={<UiPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/open-source" element={<OpenSourcePage />} />
            <Route path="/api-services" element={<ApiServicesPage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
          </Routes>
        </HashRouter>
      </div>
    </I18nProvider>
  );
}

export default App;
