import type { ImageGalleryItem } from './image-gallery.consts';
import { ImageGalleryImage, ImageGalleryTile } from './ImageGalleryTile';

// Staggered columns at each image's natural height; order runs down each
// column, the trade-off for no cropping and no gaps.
export const MasonryLayout = ({ items }: { items: ImageGalleryItem[] }) => (
  <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4">
    {items.map(item => (
      <li key={item.id} className="mb-3 break-inside-avoid">
        <ImageGalleryTile
          item={item}
          className="w-full overflow-hidden rounded-lg transition-opacity hover:opacity-90"
        >
          <ImageGalleryImage src={item.imageUrl} className="h-auto w-full" />
        </ImageGalleryTile>
      </li>
    ))}
  </ul>
);
