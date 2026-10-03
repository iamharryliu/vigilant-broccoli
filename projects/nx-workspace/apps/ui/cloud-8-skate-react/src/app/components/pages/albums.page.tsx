import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { ROUTE_PATH, albumPath } from '../../core/consts/routes.const';
import { formatAlbumDate } from '../../core/services/date.utils';
import { useSeo } from '../../core/services/seo';
import { getGalleryAlbums } from '../../core/services/sanity.service';
import { useAsyncData } from '../../core/services/use-async-data';
import { ContentContainer } from '../features/content-container';

export function AlbumsPage() {
  const { t } = useTranslation();
  const { data: albums, isLoading } = useAsyncData(getGalleryAlbums);
  useSeo({
    title: t('SEO.GALLERY.TITLE'),
    description: t('SEO.GALLERY.DESCRIPTION'),
    path: ROUTE_PATH.GALLERY,
    keywords: t('SEO.GALLERY.KEYWORDS'),
  });

  return (
    <ContentContainer>
      <section className="mb-8 reveal-up">
        {albums?.length ? (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
            {albums.map(album => (
              <Link
                key={album._id}
                to={albumPath(album.slug)}
                className="block reveal-up"
              >
                {album.coverImageUrl ? (
                  <img
                    src={album.coverImageUrl}
                    alt={album.name}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-gray-100 text-gray-500">
                    {t('GALLERY.NO_COVER')}
                  </div>
                )}
                <p className="mt-2 text-center text-base font-semibold text-gray-900">
                  {album.name}
                </p>
                <p className="mt-1 text-center text-sm text-gray-500">
                  {formatAlbumDate(album.date)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm reveal-up">
              <p className="text-base leading-7 text-gray-700">
                {t('GALLERY.UNAVAILABLE')}
              </p>
            </div>
          )
        )}
      </section>
    </ContentContainer>
  );
}
