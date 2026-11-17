import type { CSSProperties, ReactEventHandler, ReactNode } from 'react';
import { cn } from '@vigilant-broccoli/react-lib';
import {
  type ImageGalleryItem,
  interceptPlainClick,
} from './image-gallery.consts';

// The one clickable wrapper every layout renders, so links, buttons and their
// labels behave the same whichever layout is picked.
export const ImageGalleryTile = ({
  item: { label, href, onSelect },
  className,
  children,
}: {
  item: ImageGalleryItem;
  className?: string;
  children: ReactNode;
}) =>
  href ? (
    <a
      href={href}
      aria-label={label}
      onClick={onSelect && interceptPlainClick(onSelect)}
      className={cn('block', className)}
    >
      {children}
    </a>
  ) : (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      className={cn('block', className)}
    >
      {children}
    </button>
  );

export const ImageGalleryImage = ({
  src,
  className,
  onLoad,
  style,
}: {
  src: string;
  className?: string;
  onLoad?: ReactEventHandler<HTMLImageElement>;
  style?: CSSProperties;
}) => (
  <img
    src={src}
    alt=""
    loading="lazy"
    onLoad={onLoad}
    style={style}
    className={cn('block bg-muted', className)}
  />
);
