import { useTranslation } from '../../i18n';
import type { Cloud8GalleryImage } from '../../core/services/sanity.service';

export function ImageGallery({ images }: { images: Cloud8GalleryImage[] }) {
  const { t } = useTranslation();

  return (
    <div className="sm:columns-3 ps-4 pe-4">
      {images.map((image, index) => (
        <img
          key={image._key ?? index}
          className="mb-4 w-full"
          src={image.url}
          srcSet={`${image.url} 800w, ${image.url2x} 1600w`}
          sizes="(min-width: 640px) 33vw, 100vw"
          alt={image.alt || t('GALLERY.IMAGE_ALT_FALLBACK')}
          loading="lazy"
        />
      ))}
    </div>
  );
}
