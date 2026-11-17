import { type SyntheticEvent, useState } from 'react';
import type { ImageGalleryItem } from './image-gallery.consts';
import { ImageGalleryImage, ImageGalleryTile } from './ImageGalleryTile';

// Until an image loads its aspect ratio is unknown; this keeps its slot sized
// so rows don't collapse and reflow from zero.
const FALLBACK_RATIO = 4 / 3;
const ROW_HEIGHT_PX = 240;
// Caps how far an image can grow past the row height. Full rows rarely need
// more; a short row (usually the last) stops here and is centered instead of
// stretching to the full width.
const MAX_HEIGHT_PX = 300;

// Centered rows of one height filling the width: each image grows in
// proportion to its aspect ratio, so nothing is cropped and order reads left
// to right. The only state is the measured ratios.
export const JustifiedLayout = ({ items }: { items: ImageGalleryItem[] }) => {
  const [ratios, setRatios] = useState<Record<string, number>>({});

  const recordRatio =
    (id: string) =>
    ({ currentTarget }: SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = currentTarget;
      if (!naturalWidth || !naturalHeight) return;
      setRatios(prev => ({ ...prev, [id]: naturalWidth / naturalHeight }));
    };

  return (
    <ul className="flex flex-wrap justify-center gap-3">
      {items.map(item => {
        const ratio = ratios[item.id] ?? FALLBACK_RATIO;
        return (
          <li
            key={item.id}
            style={{
              flexGrow: ratio,
              flexBasis: ratio * ROW_HEIGHT_PX,
              maxWidth: ratio * MAX_HEIGHT_PX,
            }}
          >
            <ImageGalleryTile
              item={item}
              className="w-full overflow-hidden rounded-lg transition-opacity hover:opacity-90"
            >
              <ImageGalleryImage
                src={item.imageUrl}
                onLoad={recordRatio(item.id)}
                style={{ aspectRatio: ratio }}
                className="h-auto w-full"
              />
            </ImageGalleryTile>
          </li>
        );
      })}
    </ul>
  );
};
