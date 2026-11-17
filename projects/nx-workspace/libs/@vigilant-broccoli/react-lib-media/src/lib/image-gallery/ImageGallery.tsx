import {
  IMAGE_GALLERY_LAYOUT,
  type ImageGalleryItem,
  type ImageGalleryLayout,
} from './image-gallery.consts';
import { JustifiedLayout } from './JustifiedLayout';
import { MasonryLayout } from './MasonryLayout';
import { StackLayout, type StackLayoutLabels } from './StackLayout';

// A stateless switch over the layouts: callers own the layout choice and
// each item's call to action (href and/or onSelect).
export const ImageGallery = ({
  items,
  layout,
  stackLabels,
}: {
  items: ImageGalleryItem[];
  layout: ImageGalleryLayout;
  stackLabels?: StackLayoutLabels;
}) => {
  switch (layout) {
    case IMAGE_GALLERY_LAYOUT.JUSTIFIED:
      return <JustifiedLayout items={items} />;
    case IMAGE_GALLERY_LAYOUT.STACK:
      return <StackLayout items={items} labels={stackLabels} />;
    default:
      return <MasonryLayout items={items} />;
  }
};
