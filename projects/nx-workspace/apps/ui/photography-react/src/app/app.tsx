import { ThemeProvider } from '@vigilant-broccoli/react-lib';
import { PHOTOGRAPHY_STATE } from '../lib/photography.consts';
import { Album, PhotographyState } from '../lib/photography.types';
import { AlbumList } from './components/AlbumList';
import { AlbumView } from './components/AlbumView';
import { useAlbums } from './hooks/useAlbums';
import { useHashSlug } from './hooks/useHashSlug';
import { usePageTitle } from './hooks/usePageTitle';
import { I18nProvider, useTranslation } from './i18n';

const THEME_STORAGE_KEY = 'photography-theme';

const AlbumIndex = ({
  state,
  albums,
  missingSlug,
}: {
  state: PhotographyState;
  albums: Album[];
  missingSlug: boolean;
}) => {
  const { t } = useTranslation();
  usePageTitle(t('ALBUMS.TITLE'));

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t('ALBUMS.TITLE')}</h1>
      {missingSlug && (
        <p className="text-muted-foreground">{t('ALBUM.NOT_FOUND')}</p>
      )}
      <AlbumList state={state} albums={albums} />
    </section>
  );
};

const Albums = () => {
  const { state, albums } = useAlbums();
  const slug = useHashSlug();
  const album = albums.find(candidate => candidate.slug === slug);

  if (slug && album) return <AlbumView album={album} />;
  return (
    <AlbumIndex
      state={state}
      albums={albums}
      missingSlug={Boolean(slug) && state === PHOTOGRAPHY_STATE.READY}
    />
  );
};

export const App = () => (
  <I18nProvider>
    <ThemeProvider storageKey={THEME_STORAGE_KEY}>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 text-foreground">
        <Albums />
      </main>
    </ThemeProvider>
  </I18nProvider>
);

export default App;
