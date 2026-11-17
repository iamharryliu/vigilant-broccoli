import { useState } from 'react';
import { Layers, LayoutDashboard, Rows3 } from 'lucide-react';
import {
  TabbedView,
  type TabbedViewTab,
} from '@vigilant-broccoli/react-lib-higher-level';
import {
  IMAGE_GALLERY_LAYOUT,
  ImageGallery,
  type ImageGalleryItem,
  type ImageGalleryLayout,
} from '@vigilant-broccoli/react-lib-media';
import { DemoSection } from './DemoSection';

const PLACEHOLDER_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
];
// Mixed landscape, portrait, square and panorama sizes so each layout's
// handling of aspect ratios shows.
const PLACEHOLDER_SIZES: [number, number][] = [
  [1200, 800],
  [800, 1200],
  [1000, 1000],
  [1600, 900],
  [900, 1600],
  [1600, 600],
];
const PLACEHOLDER_COUNT = 14;

const TAB_ICON_SIZE = 16;
const LAYOUT_TAB: Record<
  ImageGalleryLayout,
  { label: string; icon: typeof Layers }
> = {
  [IMAGE_GALLERY_LAYOUT.MASONRY]: { label: 'Masonry', icon: LayoutDashboard },
  [IMAGE_GALLERY_LAYOUT.JUSTIFIED]: { label: 'Justified', icon: Rows3 },
  [IMAGE_GALLERY_LAYOUT.STACK]: { label: 'Stack', icon: Layers },
};

const toPlaceholderImage = (index: number) => {
  const [width, height] = PLACEHOLDER_SIZES[index % PLACEHOLDER_SIZES.length];
  const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" fill="white" font-size="96" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">${index + 1}</text></svg>`,
  )}`;
};

export const ImageGalleryDemo = () => {
  const [layout, setLayout] = useState<ImageGalleryLayout>(
    IMAGE_GALLERY_LAYOUT.MASONRY,
  );
  const [selected, setSelected] = useState<number | null>(null);

  const items: ImageGalleryItem[] = Array.from(
    { length: PLACEHOLDER_COUNT },
    (_, index) => ({
      id: `placeholder-${index}`,
      imageUrl: toPlaceholderImage(index),
      label: `Select image ${index + 1}`,
      onSelect: () => setSelected(index),
    }),
  );

  // Same icon-only tab shell as the manager apps' home panels.
  const tabs: TabbedViewTab<ImageGalleryLayout>[] = (
    Object.values(IMAGE_GALLERY_LAYOUT) as ImageGalleryLayout[]
  ).map(value => {
    const { label, icon: Icon } = LAYOUT_TAB[value];
    return {
      value,
      label,
      icon: <Icon size={TAB_ICON_SIZE} />,
      content: <ImageGallery layout={value} items={items} />,
    };
  });

  return (
    <DemoSection title="Image Gallery">
      <TabbedView
        tabs={tabs}
        value={layout}
        onValueChange={setLayout}
        actions={
          <p className="text-sm text-muted-foreground">
            {selected === null
              ? 'Click an image to run its onSelect.'
              : `Selected image ${selected + 1}.`}
          </p>
        }
      />
    </DemoSection>
  );
};
