'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from './Dialog';
import { cn } from '../utils/cn';

const SWIPE_THRESHOLD = 50;
const DEFAULT_ALT = 'Image';
const KEY_ARROW_LEFT = 'ArrowLeft';
const KEY_ARROW_RIGHT = 'ArrowRight';
const PREVIOUS_IMAGE_LABEL = 'Previous image';
const NEXT_IMAGE_LABEL = 'Next image';
const GO_TO_IMAGE_LABEL_PREFIX = 'Go to image';

interface ImageCarouselDialogProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alt?: string;
}

export function ImageCarouselDialog({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
  alt,
}: ImageCarouselDialogProps) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open || images.length < 2) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === KEY_ARROW_LEFT) {
        setIndex(i => (i - 1 + images.length) % images.length);
      } else if (event.key === KEY_ARROW_RIGHT) {
        setIndex(i => (i + 1) % images.length);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, images.length]);

  if (!images.length) return null;

  const showPrev = () => setIndex(i => (i - 1 + images.length) % images.length);
  const showNext = () => setIndex(i => (i + 1) % images.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'left-0 top-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 text-white',
          'sm:left-[50%] sm:top-[50%] sm:h-[85vh] sm:w-[90vw] sm:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2',
          'flex flex-col gap-0 rounded-none border-none bg-black p-0 sm:rounded-lg',
        )}
      >
        <DialogTitle className="sr-only">
          {`${alt ?? DEFAULT_ALT} ${index + 1} of ${images.length}`}
        </DialogTitle>
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden"
          onTouchStart={event => {
            touchStartX.current = event.touches[0].clientX;
          }}
          onTouchEnd={event => {
            if (touchStartX.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStartX.current;
            if (delta > SWIPE_THRESHOLD) showPrev();
            else if (delta < -SWIPE_THRESHOLD) showNext();
            touchStartX.current = null;
          }}
        >
          <img
            src={images[index]}
            alt={`${alt ?? DEFAULT_ALT} ${index + 1}`}
            className="max-h-full max-w-full select-none object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label={PREVIOUS_IMAGE_LABEL}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 hover:bg-black/70"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label={NEXT_IMAGE_LABEL}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 hover:bg-black/70"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-3">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${GO_TO_IMAGE_LABEL_PREFIX} ${i + 1}`}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  i === index ? 'bg-white' : 'bg-white/30',
                )}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
