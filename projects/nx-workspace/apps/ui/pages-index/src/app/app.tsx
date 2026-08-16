import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import {
  DarkModeIconButton,
  ThemeProvider,
  useTheme,
  useThemeKeybind,
} from '@vigilant-broccoli/react-lib';
import { I18nProvider } from './i18n';
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

function ThemedApp() {
  const { appearance, toggleTheme } = useTheme();
  useThemeKeybind();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', appearance === 'dark');
  }, [appearance]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="fixed top-4 right-4 z-10">
        <DarkModeIconButton
          dark={appearance === 'dark'}
          onToggle={toggleTheme}
        />
      </div>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/open-source" element={<OpenSourcePage />} />
          <Route path="/open-source/github" element={<GithubReadmePage />} />
          <Route path="/open-source/docker" element={<DockerImagesPage />} />
          <Route
            path="/open-source/docker/:image"
            element={<DockerImageReadmePage />}
          />
          <Route path="/open-source/npm" element={<NpmPackagesPage />} />
          <Route
            path="/open-source/npm/:pkg"
            element={<NpmPackageReadmePage />}
          />
          <Route path="/web-applications" element={<WebApplicationsPage />} />
          <Route path="/api-services" element={<ApiServicesPage />} />
          <Route
            path="/api-services/:service"
            element={<ApiServiceDocsPage />}
          />
        </Routes>
      </HashRouter>
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
