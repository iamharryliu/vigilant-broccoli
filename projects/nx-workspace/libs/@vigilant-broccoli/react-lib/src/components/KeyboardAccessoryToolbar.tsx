'use client';

import { useEffect, useState } from 'react';
import { isTextEntryElement, pressEnter } from '../utils/press-enter.utils';

// Pins the toolbar to the bottom of the visual viewport, which shrinks when
// the on-screen keyboard opens even where the layout viewport does not.
const useVisualViewportInset = () => {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const sync = () =>
      setInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
      );
    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);
    return () => {
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
    };
  }, []);

  return inset;
};

const useFocusedTextEntry = () => {
  const [focused, setFocused] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const onFocusIn = (event: FocusEvent) =>
      setFocused(
        isTextEntryElement(event.target as Element)
          ? (event.target as HTMLElement)
          : null,
      );
    const onFocusOut = (event: FocusEvent) => {
      // A focus move to another field fires focusin right after, so only
      // clear when focus actually leaves for a non-field.
      if (!isTextEntryElement(event.relatedTarget as Element | null))
        setFocused(null);
    };
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  return focused;
};

export const KeyboardAccessoryToolbar = () => {
  const focused = useFocusedTextEntry();
  const inset = useVisualViewportInset();

  if (!focused) return null;

  return (
    <div
      role="toolbar"
      aria-label="Keyboard keys"
      style={{
        bottom: inset,
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      }}
      className="fixed inset-x-0 z-50 flex gap-1.5 border-t border-gray-300 bg-gray-100 p-1.5 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <button
        type="button"
        // Keeps focus in the field so the keyboard stays open.
        onPointerDown={event => event.preventDefault()}
        onClick={() => {
          if (
            document.activeElement instanceof HTMLElement &&
            isTextEntryElement(document.activeElement)
          )
            pressEnter(document.activeElement);
        }}
        className="min-h-[44px] min-w-[44px] touch-manipulation rounded-md border border-gray-400 bg-white px-3 text-[15px] text-gray-900 active:bg-blue-500 active:text-white dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:active:bg-blue-500"
      >
        Enter
      </button>
    </div>
  );
};
