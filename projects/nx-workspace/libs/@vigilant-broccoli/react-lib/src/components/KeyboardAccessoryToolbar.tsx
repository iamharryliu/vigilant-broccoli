'use client';

import { useEffect, useState } from 'react';
import {
  isTextEntryElement,
  pressEnter,
  pressRedo,
  pressUndo,
} from '../utils/keyboard-accessory.utils';

// Anchors the toolbar to the bottom edge of the visual viewport, which
// shrinks when the on-screen keyboard opens. Measured from the layout
// viewport's top (where `position: fixed` resolves) because iOS reports
// `innerHeight` inconsistently while the keyboard is open or animating.
const useVisualViewportBottom = () => {
  const [viewport, setViewport] = useState<{
    bottom: number;
    keyboardOpen: boolean;
  } | null>(null);

  useEffect(() => {
    const visual = window.visualViewport;
    if (!visual) return;
    const sync = () => {
      const bottom = visual.offsetTop + visual.height;
      setViewport({
        bottom,
        keyboardOpen: document.documentElement.clientHeight - bottom > 1,
      });
    };
    sync();
    visual.addEventListener('resize', sync);
    visual.addEventListener('scroll', sync);
    window.addEventListener('scroll', sync);
    // The keyboard can finish animating without a final viewport event.
    document.addEventListener('focusin', sync);
    return () => {
      visual.removeEventListener('resize', sync);
      visual.removeEventListener('scroll', sync);
      window.removeEventListener('scroll', sync);
      document.removeEventListener('focusin', sync);
    };
  }, []);

  return viewport;
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

const KEYS = [
  { label: 'Undo', press: pressUndo },
  { label: 'Redo', press: pressRedo },
  { label: 'Enter', press: pressEnter },
];

const KEY_CLASS_NAME =
  'min-h-[44px] min-w-[44px] touch-manipulation rounded-md border border-gray-400 bg-white px-3 text-[15px] text-gray-900 active:bg-blue-500 active:text-white dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:active:bg-blue-500';

const pressOnFocused = (press: (element: HTMLElement) => void) => {
  const active = document.activeElement;
  if (active instanceof HTMLElement && isTextEntryElement(active))
    press(active);
};

export const KeyboardAccessoryToolbar = () => {
  const focused = useFocusedTextEntry();
  const viewport = useVisualViewportBottom();

  if (!focused) return null;

  return (
    <div
      role="toolbar"
      aria-label="Keyboard keys"
      style={
        viewport
          ? {
              top: viewport.bottom,
              transform: 'translateY(-100%)',
              // The home-indicator inset sits under the keyboard when it is open.
              paddingBottom: viewport.keyboardOpen
                ? 6
                : 'max(6px, env(safe-area-inset-bottom))',
            }
          : {
              bottom: 0,
              paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
            }
      }
      className="fixed inset-x-0 z-50 flex justify-end gap-1.5 border-t border-gray-300 bg-gray-100 p-1.5 dark:border-neutral-700 dark:bg-neutral-900"
    >
      {KEYS.map(({ label, press }) => (
        <button
          key={label}
          type="button"
          // Keeps focus in the field so the keyboard stays open.
          onPointerDown={event => event.preventDefault()}
          onClick={() => pressOnFocused(press)}
          className={KEY_CLASS_NAME}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
