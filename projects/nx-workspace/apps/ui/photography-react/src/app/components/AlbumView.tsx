import { useState } from 'react';
import {
  ImageCarouselDialog,
  interceptPlainClick,
  MasonryLayout,
} from '@vigilant-broccoli/react-lib-media';
import { photoUrl } from '../../lib/photography.api';
import { Album } from '../../lib/photography.types';
import { usePageTitle } from '../hooks/usePageTitle';
import { HOME_PATH, toAppHref } from '../hooks/usePathSlug';
import { useTranslation } from '../i18n';

export const AlbumView = ({
  album,
  onNavigate,
}: {
  album: Album;
  onNavigate: (path: string) => void;
}) => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const urls = album.photos.map(({ path }) => photoUrl(path));
  usePageTitle(album.title);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <a
          href={toAppHref(HOME_PATH)}
          onClick={interceptPlainClick(() => onNavigate(HOME_PATH))}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← {t('ACTIONS.BACK')}
        </a>
        <h1 className="text-2xl font-semibold">{album.title}</h1>
      </div>
      <MasonryLayout
        items={urls.map((url, index) => ({
          id: url,
          imageUrl: url,
          label: t('ALBUM.OPEN_PHOTO', {
            number: index + 1,
            name: album.title,
          }),
          onSelect: () => setOpenIndex(index),
        }))}
      />
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
