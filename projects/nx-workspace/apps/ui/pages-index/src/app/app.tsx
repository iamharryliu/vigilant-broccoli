import { HashRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider } from './i18n';
import { HomePage } from './pages/HomePage';
import { UiPage } from './pages/UiPage';
import { StatusPage } from './pages/StatusPage';
import { OpenSourcePage } from './pages/OpenSourcePage';
import { WebApplicationsPage } from './pages/WebApplicationsPage';
import { ApiServicesPage } from './pages/ApiServicesPage';

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
            <Route path="/web-applications" element={<WebApplicationsPage />} />
            <Route path="/api-services" element={<ApiServicesPage />} />
          </Routes>
        </HashRouter>
      </div>
    </I18nProvider>
  );
}

export default App;
