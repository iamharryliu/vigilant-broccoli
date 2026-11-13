import { Skeleton } from '@vigilant-broccoli/react-lib';
import { photoUrl } from '../../lib/photography.api';
import {
  PHOTOGRAPHY_STATE,
  SKELETON_ALBUM_COUNT,
} from '../../lib/photography.consts';
import { Album, PhotographyState } from '../../lib/photography.types';
import { useTranslation } from '../i18n';

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';
const COVER_CLASS = 'aspect-[4/3] w-full rounded-lg';

export const AlbumList = ({
  state,
  albums,
}: {
  state: PhotographyState;
  albums: Album[];
}) => {
  const { t } = useTranslation();

  if (state === PHOTOGRAPHY_STATE.LOADING) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: SKELETON_ALBUM_COUNT }, (_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className={COVER_CLASS} />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
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
    <ul className={GRID_CLASS}>
      {albums.map(({ slug, title, photos }) => (
        <li key={slug}>
          <a
            href={`#/${encodeURIComponent(slug)}`}
            aria-label={t('ALBUMS.OPEN_ALBUM', { name: title })}
            className="group flex flex-col gap-2"
          >
            <img
              src={photoUrl(photos[0].path)}
              alt=""
              loading="lazy"
              className={`${COVER_CLASS} bg-muted object-cover transition-opacity group-hover:opacity-90`}
            />
            <span className="font-medium">{title}</span>
            <span className="text-sm text-muted-foreground">
              {photos.length === 1
                ? t('ALBUMS.PHOTO_COUNT_ONE')
                : t('ALBUMS.PHOTO_COUNT_OTHER', { count: photos.length })}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
};
