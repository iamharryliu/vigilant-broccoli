import { useEffect } from 'react';
import {
  Route,
  Routes,
  useLocation,
  useMatch,
  Navigate,
} from 'react-router-dom';
import { AppProvider } from './core/services/app-context';
import { ThemeProvider } from './core/services/theme-context';
import { initAnalytics, usePageviewTracking } from './core/services/analytics';
import {
  ABOUT_ROUTE,
  CALENDAR_ROUTE,
  CAREER_ROUTE,
  COMPONENT_LIBRARY_ROUTE,
  CONTACT_ROUTE,
  DEFAULT_DESCRIPTION,
  INDEX_ROUTE,
  LEETCODE_ROUTE,
  LEETCODE_SOLUTION_ROUTE,
  LINK_TREE_ROUTE,
  ROUTES,
  type RouteMeta,
} from './core/consts/routes.const';
import { ENVIRONMENT } from '../environments/environment';
import { HomePage } from './components/pages/home.page';
import { AboutPage } from './components/pages/about.page';
import { CareerPage } from './components/pages/career.page';
import { ContactPage } from './components/pages/contact.page';
import { CalendarPage } from './components/pages/calendar.page';
import { LinkTreePage } from './components/pages/link-tree.page';
import { ComponentLibraryPage } from './components/pages/component-library.page';
import { LeetCodePage } from './components/pages/leet-code.page';

initAnalytics();

const updateMetaTag = (
  selector: string,
  attr: 'name' | 'property',
  key: string,
  content: string,
) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const findRouteMeta = (pathname: string): RouteMeta | undefined => {
  const direct = ROUTES.find(r => r.path === pathname);
  if (direct) return direct;
  if (pathname.startsWith('/grind-75/')) return LEETCODE_SOLUTION_ROUTE;
  return undefined;
};

function SeoUpdater() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const meta = findRouteMeta(location.pathname);
    const title = meta?.title ?? 'home';
    const description = meta?.description ?? DEFAULT_DESCRIPTION;
    const fullTitle = `design by harry - ${title}`;
    const url = `${ENVIRONMENT.APP_URL}${location.pathname}${location.search}`;

    document.title = fullTitle;
    updateMetaTag(
      'meta[name="description"]',
      'name',
      'description',
      description,
    );
    updateMetaTag(
      'meta[property="og:title"]',
      'property',
      'og:title',
      fullTitle,
    );
    updateMetaTag(
      'meta[property="og:description"]',
      'property',
      'og:description',
      description,
    );
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
    updateMetaTag(
      'meta[name="twitter:title"]',
      'name',
      'twitter:title',
      fullTitle,
    );
    updateMetaTag(
      'meta[name="twitter:description"]',
      'name',
      'twitter:description',
      description,
    );

    const canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (canonical) canonical.setAttribute('href', url);
  }, [location.pathname, location.search]);

  return null;
}

function PageviewTracker() {
  usePageviewTracking();
  return null;
}

export function App() {
  // Touch matches to silence unused warning; not strictly needed.
  useMatch('/');
  return (
    <ThemeProvider>
      <AppProvider>
        <SeoUpdater />
        <PageviewTracker />
        <Routes>
          <Route path={INDEX_ROUTE.path} element={<HomePage />} />
          <Route path={ABOUT_ROUTE.path} element={<AboutPage />} />
          <Route path={CAREER_ROUTE.path} element={<CareerPage />} />
          <Route path={CONTACT_ROUTE.path} element={<ContactPage />} />
          <Route path={CALENDAR_ROUTE.path} element={<CalendarPage />} />
          <Route path={LINK_TREE_ROUTE.path} element={<LinkTreePage />} />
          <Route
            path={COMPONENT_LIBRARY_ROUTE.path}
            element={<ComponentLibraryPage />}
          />
          <Route path={LEETCODE_ROUTE.path} element={<LeetCodePage />} />
          <Route
            path={LEETCODE_SOLUTION_ROUTE.path}
            element={<LeetCodePage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
