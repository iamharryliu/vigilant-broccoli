import { Skeleton } from '@vigilant-broccoli/react-lib';
import { photoUrl } from '../../lib/photography.api';
import {
  PHOTOGRAPHY_STATE,
  SKELETON_ALBUM_COUNT,
} from '../../lib/photography.consts';
import { Album, PhotographyState } from '../../lib/photography.types';
import { albumPath, toAppHref } from '../hooks/usePathSlug';
import { useTranslation } from '../i18n';
import { MasonryLayout } from '@vigilant-broccoli/react-lib-media';

// Staggered placeholder heights so loading reads as a gallery, not a table.
const SKELETON_HEIGHT_CLASSES = ['h-48', 'h-64', 'h-40', 'h-56', 'h-72'];

export const AlbumList = ({
  state,
  albums,
  onNavigate,
}: {
  state: PhotographyState;
  albums: Album[];
  onNavigate: (path: string) => void;
}) => {
  const { t } = useTranslation();

  if (state === PHOTOGRAPHY_STATE.LOADING) {
    return (
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {Array.from({ length: SKELETON_ALBUM_COUNT }, (_, index) => (
          <div key={index} className="mb-3 break-inside-avoid">
            <Skeleton
              className={`w-full rounded-lg ${
                SKELETON_HEIGHT_CLASSES[index % SKELETON_HEIGHT_CLASSES.length]
              }`}
            />
          </div>
        ))}
      </div>
    );
  }
  if (state === PHOTOGRAPHY_STATE.ERROR) {
    return <p role="alert">{t('STATUS.ERROR')}</p>;
  }
  if (albums.length === 0) {
    return <p className="text-muted-foreground">{t('ALBUMS.EMPTY')}</p>;
  }
  return (
    <MasonryLayout
      items={albums.map(({ slug, title, photos }) => ({
        id: slug,
        imageUrl: photoUrl(photos[0].path),
        label: t('ALBUMS.OPEN_ALBUM', { name: title }),
        href: toAppHref(albumPath(slug)),
        onSelect: () => onNavigate(albumPath(slug)),
      }))}
    />
  );
};
