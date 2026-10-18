'use client';

import { useEffect } from 'react';

const VIEWPORT_HEIGHT_VAR = '--app-viewport-h';
const KEYBOARD_OPEN_ATTRIBUTE = 'data-keyboard-open';
const RESIZE_EVENT = 'resize';
const KEYBOARD_MIN_HEIGHT_PX = 100;

// dvh ignores the on-screen keyboard on iOS Safari and on Android Chrome's
// default resizes-visual mode; only the visual viewport shrinks. Scaling by
// viewport.scale keeps pinch-zoom from being mistaken for a keyboard.
export const useVisualViewportHeight = () => {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;

    const update = () => {
      const visibleHeight = viewport.height * viewport.scale;
      root.style.setProperty(VIEWPORT_HEIGHT_VAR, `${visibleHeight}px`);
      root.setAttribute(
        KEYBOARD_OPEN_ATTRIBUTE,
        String(window.innerHeight - visibleHeight > KEYBOARD_MIN_HEIGHT_PX),
      );
    };

    update();
    viewport.addEventListener(RESIZE_EVENT, update);
    return () => {
      viewport.removeEventListener(RESIZE_EVENT, update);
      root.style.removeProperty(VIEWPORT_HEIGHT_VAR);
      root.removeAttribute(KEYBOARD_OPEN_ATTRIBUTE);
    };
  }, []);
};
