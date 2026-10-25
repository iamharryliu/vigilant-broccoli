import {
  ImageCarouselDialog,
  ImageFilmstrip,
} from '@vigilant-broccoli/react-lib-media';
import { useState } from 'react';
import { DemoSection } from './DemoSection';

const PLACEHOLDER_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const PLACEHOLDER_SIZE = 640;

const toPlaceholderImage = (color: string, index: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PLACEHOLDER_SIZE}" height="${PLACEHOLDER_SIZE}"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" fill="white" font-size="64" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">${index + 1}</text></svg>`,
  )}`;

const IMAGES = PLACEHOLDER_COLORS.map(toPlaceholderImage);

export const ImageCarouselDemo = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <DemoSection title="Image Filmstrip">
        <ImageFilmstrip
          urls={IMAGES}
          alt="Placeholder"
          onSelect={setSelectedIndex}
        />
      </DemoSection>
      <DemoSection title="Image Carousel Dialog">
        <p className="text-sm text-muted-foreground">
          Click a filmstrip thumbnail to open the carousel at that image.
        </p>
        <ImageCarouselDialog
          images={IMAGES}
          initialIndex={selectedIndex ?? 0}
          open={selectedIndex !== null}
          onOpenChange={open => {
            if (!open) setSelectedIndex(null);
          }}
          alt="Placeholder"
        />
      </DemoSection>
    </div>
  );
};
