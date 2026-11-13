import { useState } from 'react';
import { ImageCarouselDialog } from '@vigilant-broccoli/react-lib-media';
import { photoUrl } from '../../lib/photography.api';
import { Album } from '../../lib/photography.types';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTranslation } from '../i18n';

export const AlbumView = ({ album }: { album: Album }) => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const urls = album.photos.map(({ path }) => photoUrl(path));
  usePageTitle(album.title);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <a href="#/" className="text-sm text-muted-foreground hover:underline">
          ← {t('ACTIONS.BACK')}
        </a>
        <h1 className="text-2xl font-semibold">{album.title}</h1>
      </div>
      <ul className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {urls.map((url, index) => (
          <li key={url} className="mb-3 break-inside-avoid">
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={t('ALBUM.OPEN_PHOTO', {
                number: index + 1,
                name: album.title,
              })}
              className="block w-full"
            >
              <img
                src={url}
                alt=""
                loading="lazy"
                className="w-full rounded-lg bg-muted"
              />
            </button>
          </li>
        ))}
      </ul>
      <ImageCarouselDialog
        images={urls}
        initialIndex={openIndex ?? 0}
        open={openIndex !== null}
        onOpenChange={open => {
          if (!open) setOpenIndex(null);
        }}
        alt={album.title}
      />
    </section>
  );
};
