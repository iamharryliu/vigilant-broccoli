import { useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { I18nProvider } from './i18n';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { StatusPage } from './pages/StatusPage';
import { OpenSourcePage } from './pages/OpenSourcePage';
import { GithubReadmePage } from './pages/GithubReadmePage';
import { DockerImagesPage } from './pages/DockerImagesPage';
import { DockerImageReadmePage } from './pages/DockerImageReadmePage';
import { NpmPackagesPage } from './pages/NpmPackagesPage';
import { NpmPackageReadmePage } from './pages/NpmPackageReadmePage';
import { WebApplicationsPage } from './pages/WebApplicationsPage';
import { ApiServicesPage } from './pages/ApiServicesPage';
import { ApiServiceDocsPage } from './pages/ApiServiceDocsPage';

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <I18nProvider>
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <HashRouter>
          <Sidebar
            mobileOpen={sidebarOpen}
            onMobileClose={() => setSidebarOpen(false)}
          />
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(open => !open)}
            className="fixed top-4 left-4 z-40 md:hidden cursor-pointer rounded-md p-1.5 bg-white text-gray-500 shadow-sm hover:bg-gray-50 hover:text-black dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="pl-0 md:pl-14 md:peer-hover:pl-48 transition-[padding] duration-200">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/open-source" element={<OpenSourcePage />} />
              <Route
                path="/open-source/github"
                element={<GithubReadmePage />}
              />
              <Route
                path="/open-source/docker"
                element={<DockerImagesPage />}
              />
              <Route
                path="/open-source/docker/:image"
                element={<DockerImageReadmePage />}
              />
              <Route path="/open-source/npm" element={<NpmPackagesPage />} />
              <Route
                path="/open-source/npm/:pkg"
                element={<NpmPackageReadmePage />}
              />
              <Route
                path="/web-applications"
                element={<WebApplicationsPage />}
              />
              <Route path="/api-services" element={<ApiServicesPage />} />
              <Route
                path="/api-services/:service"
                element={<ApiServiceDocsPage />}
              />
            </Routes>
          </div>
        </HashRouter>
      </div>
    </I18nProvider>
  );
}

export default App;
