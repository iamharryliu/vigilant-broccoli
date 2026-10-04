import { lazy, Suspense, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { I18nProvider } from './i18n';
import { ROUTE_PATH } from './core/consts/routes.const';
import { initAnalytics, usePageviewTracking } from './core/services/analytics';
import { GeneralLayout } from './components/layouts/general-layout';
import { HomePage } from './components/pages/home.page';

const ContactPage = lazy(() =>
  import('./components/pages/contact.page').then(module => ({
    default: module.ContactPage,
  })),
);
const CalendarPage = lazy(() =>
  import('./components/pages/calendar.page').then(module => ({
    default: module.CalendarPage,
  })),
);
const FaqPage = lazy(() =>
  import('./components/pages/faq.page').then(module => ({
    default: module.FaqPage,
  })),
);
const WaiverPage = lazy(() =>
  import('./components/pages/waiver.page').then(module => ({
    default: module.WaiverPage,
  })),
);
const PlaylistsPage = lazy(() =>
  import('./components/pages/playlists.page').then(module => ({
    default: module.PlaylistsPage,
  })),
);
const AlbumsPage = lazy(() =>
  import('./components/pages/albums.page').then(module => ({
    default: module.AlbumsPage,
  })),
);
const AlbumPage = lazy(() =>
  import('./components/pages/album.page').then(module => ({
    default: module.AlbumPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('./components/pages/not-found.page').then(module => ({
    default: module.NotFoundPage,
  })),
);

initAnalytics();

function NavigationEffects() {
  const { pathname } = useLocation();
  usePageviewTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <I18nProvider>
      <NavigationEffects />
      <GeneralLayout>
        <Suspense
          fallback={
            <div
              aria-busy="true"
              className="flex min-h-[50vh] items-center justify-center"
            >
              <LoaderCircle
                aria-hidden="true"
                className="size-6 animate-spin"
              />
            </div>
          }
        >
          <Routes>
            <Route path={ROUTE_PATH.HOME} element={<HomePage />} />
            <Route path={ROUTE_PATH.CONTACT} element={<ContactPage />} />
            <Route path={ROUTE_PATH.CALENDAR} element={<CalendarPage />} />
            <Route path={ROUTE_PATH.FAQ} element={<FaqPage />} />
            <Route path={ROUTE_PATH.WAIVER} element={<WaiverPage />} />
            <Route path={ROUTE_PATH.PLAYLISTS} element={<PlaylistsPage />} />
            <Route path={ROUTE_PATH.GALLERY} element={<AlbumsPage />} />
            <Route path={ROUTE_PATH.ALBUM} element={<AlbumPage />} />
            <Route path={ROUTE_PATH.WILD_CARD} element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </GeneralLayout>
    </I18nProvider>
  );
}

export default App;
