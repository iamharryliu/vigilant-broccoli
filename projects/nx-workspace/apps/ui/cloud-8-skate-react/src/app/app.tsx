import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { I18nProvider } from './i18n';
import { ROUTE_PATH } from './core/consts/routes.const';
import { initAnalytics, usePageviewTracking } from './core/services/analytics';
import { GeneralLayout } from './components/layouts/general-layout';
import { HomePage } from './components/pages/home.page';
import { ContactPage } from './components/pages/contact.page';
import { MorePage } from './components/pages/more.page';
import { CalendarPage } from './components/pages/calendar.page';
import { FaqPage } from './components/pages/faq.page';
import { WaiverPage } from './components/pages/waiver.page';
import { PlaylistsPage } from './components/pages/playlists.page';
import { TerminologyPage } from './components/pages/terminology.page';
import { AlbumsPage } from './components/pages/albums.page';
import { AlbumPage } from './components/pages/album.page';
import { NotFoundPage } from './components/pages/not-found.page';

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
        <Routes>
          <Route path={ROUTE_PATH.HOME} element={<HomePage />} />
          <Route path={ROUTE_PATH.CONTACT} element={<ContactPage />} />
          <Route path={ROUTE_PATH.MORE} element={<MorePage />} />
          <Route path={ROUTE_PATH.MORE_SUBPAGE} element={<MorePage />} />
          <Route path={ROUTE_PATH.CALENDAR} element={<CalendarPage />} />
          <Route path={ROUTE_PATH.FAQ} element={<FaqPage />} />
          <Route path={ROUTE_PATH.WAIVER} element={<WaiverPage />} />
          <Route path={ROUTE_PATH.PLAYLISTS} element={<PlaylistsPage />} />
          <Route path={ROUTE_PATH.TERMINOLOGY} element={<TerminologyPage />} />
          <Route path={ROUTE_PATH.GALLERY} element={<AlbumsPage />} />
          <Route path={ROUTE_PATH.ALBUM} element={<AlbumPage />} />
          <Route path={ROUTE_PATH.WILD_CARD} element={<NotFoundPage />} />
        </Routes>
      </GeneralLayout>
    </I18nProvider>
  );
}

export default App;
