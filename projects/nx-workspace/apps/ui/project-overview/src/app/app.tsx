import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './theme';
import { GamesPage } from './pages/GamesPage';
import { HomePage } from './pages/HomePage';
import { StatusPage } from './pages/StatusPage';
import { RepoTimelinePage } from './pages/RepoTimelinePage';
import { ProjectGraphPage } from './pages/ProjectGraphPage';
import { GithubReposPage } from './pages/GithubReposPage';
import { GithubReadmePage } from './pages/GithubReadmePage';
import { DockerImagesPage } from './pages/DockerImagesPage';
import { DockerImageReadmePage } from './pages/DockerImageReadmePage';
import { NpmPackagesPage } from './pages/NpmPackagesPage';
import { NpmPackageReadmePage } from './pages/NpmPackageReadmePage';
import { WebApplicationReadmePage } from './pages/WebApplicationReadmePage';
import { WebApplicationsPage } from './pages/WebApplicationsPage';
import { ApiServicesPage } from './pages/ApiServicesPage';
import { ApiServiceDocsPage } from './pages/ApiServiceDocsPage';
import { ChangelogPage } from './pages/ChangelogPage';
import { DeploymentsPage } from './pages/DeploymentsPage';
import { CareerPage } from './pages/CareerPage';
import { CareerExperiencePage } from './pages/CareerExperiencePage';
import { SearchProvider } from './components/SearchDialog';
import {
  isCareerHost,
  isDeploymentsHost,
  isGamesHost,
  isStatusHost,
} from './consts/hosts';
import {
  GAMES_ROUTE,
  CAREER_EXPERIENCE_ROUTE,
  CHANGELOG_ROUTE,
  DEPLOYMENTS_ROUTE,
  PROJECT_GRAPH_ROUTE,
  STATUS_ROUTE,
  WEB_APPLICATIONS_ROUTE,
} from './consts/routes';

const LEGACY_OPEN_SOURCE_PREFIX = '/open-source';

// Keeps shared links to the removed /open-source hub and its sub-pages working.
function LegacyOpenSourceRedirect() {
  const { pathname } = useLocation();
  return (
    <Navigate
      to={pathname.slice(LEGACY_OPEN_SOURCE_PREFIX.length) || '/'}
      replace
    />
  );
}

const LEGACY_HASH_ROUTE_PREFIX = '#/';

// Keeps bookmarked and shared `/#/route?query` links from the HashRouter days
// working by rewriting them to the path form.
function LegacyHashRedirect() {
  const { hash } = useLocation();
  return hash.startsWith(LEGACY_HASH_ROUTE_PREFIX) ? (
    <Navigate to={hash.slice(1)} replace />
  ) : null;
}

function StatusHostRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StatusPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function DeploymentsHostRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DeploymentsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function CareerHostRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CareerPage />} />
      <Route
        path={CAREER_EXPERIENCE_ROUTE}
        element={<CareerExperiencePage />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function GamesHostRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GamesPage />} />
      <Route path={GAMES_ROUTE} element={<GamesPage />} />
      <Route
        path={`${GAMES_ROUTE}/:app`}
        element={<WebApplicationReadmePage />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ProjectsRoutes() {
  return (
    <SearchProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path={GAMES_ROUTE} element={<GamesPage />} />
        <Route
          path={`${GAMES_ROUTE}/:app`}
          element={<WebApplicationReadmePage />}
        />
        <Route path={STATUS_ROUTE} element={<StatusPage />} />
        <Route path={DEPLOYMENTS_ROUTE} element={<DeploymentsPage />} />
        <Route path={CHANGELOG_ROUTE} element={<ChangelogPage />} />
        <Route path="/repo-timeline" element={<RepoTimelinePage />} />
        <Route path={PROJECT_GRAPH_ROUTE} element={<ProjectGraphPage />} />
        <Route
          path={`${LEGACY_OPEN_SOURCE_PREFIX}/*`}
          element={<LegacyOpenSourceRedirect />}
        />
        <Route path="/github" element={<GithubReposPage />} />
        <Route path="/github/:repo" element={<GithubReadmePage />} />
        <Route path="/docker" element={<DockerImagesPage />} />
        <Route path="/docker/:image" element={<DockerImageReadmePage />} />
        <Route path="/npm" element={<NpmPackagesPage />} />
        <Route path="/npm/:pkg" element={<NpmPackageReadmePage />} />
        <Route
          path={WEB_APPLICATIONS_ROUTE}
          element={<WebApplicationsPage />}
        />
        <Route
          path={`${WEB_APPLICATIONS_ROUTE}/:app`}
          element={<WebApplicationReadmePage />}
        />
        <Route path="/api-services" element={<ApiServicesPage />} />
        <Route path="/api-services/:service" element={<ApiServiceDocsPage />} />
      </Routes>
    </SearchProvider>
  );
}

export function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-dvh">
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <LegacyHashRedirect />
            {isGamesHost() ? (
              <GamesHostRoutes />
            ) : isStatusHost() ? (
              <StatusHostRoutes />
            ) : isDeploymentsHost() ? (
              <DeploymentsHostRoutes />
            ) : isCareerHost() ? (
              <CareerHostRoutes />
            ) : (
              <ProjectsRoutes />
            )}
          </BrowserRouter>
        </div>
      </ThemeProvider>
    </I18nProvider>
  );
}

export default App;
