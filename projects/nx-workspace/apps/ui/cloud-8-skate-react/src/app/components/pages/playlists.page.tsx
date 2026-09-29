import { useTranslation } from '../../i18n';
import { ROUTE_PATH } from '../../core/consts/routes.const';
import { useSeo } from '../../core/services/seo';
import { getPlaylistsPage } from '../../core/services/sanity.service';
import { useAsyncData } from '../../core/services/use-async-data';
import { ContentContainer } from '../features/content-container';

export function PlaylistsPage() {
  const { t } = useTranslation();
  const { data: playlistsPage, isLoading } = useAsyncData(getPlaylistsPage);
  useSeo({
    title: playlistsPage?.seoTitle || t('SEO.PLAYLISTS.TITLE'),
    description:
      playlistsPage?.seoDescription || t('SEO.PLAYLISTS.DESCRIPTION'),
    path: ROUTE_PATH.PLAYLISTS,
    keywords: playlistsPage?.seoKeywords || t('SEO.PLAYLISTS.KEYWORDS'),
  });

  return (
    <ContentContainer>
      {playlistsPage ? (
        <section className="mb-8 reveal-up">
          <h1 className="text-3xl font-bold mb-4 lg:text-4xl reveal-up reveal-up-delay-1">
            {playlistsPage.title}
          </h1>
          {playlistsPage.intro && (
            <p className="text-base leading-7 text-gray-700 mb-8 reveal-up reveal-up-delay-2">
              {playlistsPage.intro}
            </p>
          )}
          <div className="space-y-4">
            {(playlistsPage.playlistItems ?? []).map(item => (
              <article
                key={item._key ?? item.title}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm surface-card reveal-up"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold text-blue-600 underline-offset-4 hover:underline interactive-link"
                >
                  {item.title}
                </a>
                {item.curator && (
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    {t('PLAYLISTS.CURATED_BY', { curator: item.curator })}
                  </p>
                )}
                {item.description && (
                  <p className="mt-3 text-base leading-7 text-gray-700 whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : (
        !isLoading && (
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm reveal-up">
            <h1 className="text-3xl font-bold mb-4 lg:text-4xl">
              {t('PLAYLISTS.TITLE')}
            </h1>
            <p className="text-base leading-7 text-gray-700">
              {t('PLAYLISTS.UNAVAILABLE')}
            </p>
          </section>
        )
      )}
    </ContentContainer>
  );
}
