import type { MouseEvent } from 'react';

export type ImageGalleryItem = {
  id: string;
  imageUrl: string;
  // Accessible name of the tile's call to action.
  label: string;
  // A link when href is set (plain clicks call onSelect when both are set,
  // so an SPA can navigate in-app), otherwise a button calling onSelect.
  href?: string;
  onSelect?: () => void;
};

export const IMAGE_GALLERY_LAYOUT = {
  MASONRY: 'masonry',
  JUSTIFIED: 'justified',
  STACK: 'stack',
} as const;

export type ImageGalleryLayout =
  (typeof IMAGE_GALLERY_LAYOUT)[keyof typeof IMAGE_GALLERY_LAYOUT];

export const isImageGalleryLayout = (
  value: unknown,
): value is ImageGalleryLayout =>
  Object.values(IMAGE_GALLERY_LAYOUT).includes(value as ImageGalleryLayout);

// Layouts derive tilts and offsets from the id, not the index, so an image
// keeps its look when the list around it changes.
export const pickById = <T>(id: string, choices: readonly T[], salt = 0) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return choices[(hash + salt) % choices.length];
};

const PRIMARY_BUTTON = 0;

// Plain left clicks run the handler; modified or middle clicks keep the
// browser default so a link can still open in a new tab.
export const interceptPlainClick =
  (handler: () => void) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== PRIMARY_BUTTON ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    handler();
  };
