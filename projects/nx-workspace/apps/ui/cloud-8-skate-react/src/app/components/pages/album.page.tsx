import { useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { albumPath } from '../../core/consts/routes.const';
import { formatAlbumDate } from '../../core/services/date.utils';
import { useSeo } from '../../core/services/seo';
import { getGalleryAlbum } from '../../core/services/sanity.service';
import { useAsyncData } from '../../core/services/use-async-data';
import { ContentContainer } from '../features/content-container';
import { ImageGallery } from '../features/image-gallery';

export function AlbumPage() {
  const { t } = useTranslation();
  const { albumSlug = '' } = useParams();
  const { data: album, isLoading } = useAsyncData(
    () => getGalleryAlbum(albumSlug),
    albumSlug,
  );
  useSeo({
    title: album?.name ?? t('SEO.ALBUM.TITLE'),
    description:
      album?.description ||
      t('SEO.ALBUM.DESCRIPTION', { name: album?.name ?? '' }),
    path: albumPath(albumSlug),
    keywords: t('SEO.ALBUM.KEYWORDS'),
  });

  return (
    <ContentContainer>
      {album ? (
        <section className="mb-8">
          <h1 className="mb-4 text-3xl font-bold lg:text-4xl">{album.name}</h1>
          <p className="mb-2 text-sm text-gray-500">
            {formatAlbumDate(album.date)}
          </p>
          {album.description && (
            <p className="mb-8 text-base leading-7 text-gray-700">
              {album.description}
            </p>
          )}
          <ImageGallery images={album.images ?? []} />
        </section>
      ) : (
        !isLoading && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-base leading-7 text-gray-700">
              {t('GALLERY.ALBUM_UNAVAILABLE')}
            </p>
          </section>
        )
      )}
    </ContentContainer>
  );
}
