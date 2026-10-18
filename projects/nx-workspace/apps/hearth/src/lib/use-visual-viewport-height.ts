'use client';

import { useEffect } from 'react';
import { centerTextareaCaret } from './center-textarea-caret';

const VIEWPORT_HEIGHT_VAR = '--app-viewport-h';
const KEYBOARD_OPEN_ATTRIBUTE = 'data-keyboard-open';
const RESIZE_EVENT = 'resize';
const SCROLL_EVENT = 'scroll';
const KEYBOARD_MIN_HEIGHT_PX = 100;
const FIT_TOLERANCE_PX = 1;
// The body is at least 100vh (theme root min-height), so fit is measured on the
// app content wrapper instead.
export const APP_CONTENT_ATTRIBUTE = 'data-app-content';

// dvh ignores the on-screen keyboard on iOS Safari and on Android Chrome's
// default resizes-visual mode; only the visual viewport shrinks. Scaling by
// viewport.scale keeps pinch-zoom from being mistaken for a keyboard.
//
// When the keyboard opens, iOS pans the visual viewport down to the caret
// based on the pre-shrink layout. Once a full-height page shrinks to the
// visible height, that pan leaves blank space above the keyboard with the board
// scrolled out of view, so a page that now fits is scrolled back to the top
// (whatever the keyboard heuristic says, since a fitting page has nothing to
// scroll to). Taller pages keep their scroll so inputs further down stay
// reachable. Chrome on iOS reports the pan through window scroll rather than
// visualViewport scroll, so both are watched.
export const useVisualViewportHeight = () => {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;
    let lastHeight = viewport.height * viewport.scale;

    const resetStalePan = () => {
      const visibleHeight = viewport.height * viewport.scale;
      const content = document.querySelector<HTMLElement>(
        `[${APP_CONTENT_ATTRIBUTE}]`,
      );
      const pageFits =
        !!content &&
        content.offsetTop + content.offsetHeight <=
          visibleHeight + FIT_TOLERANCE_PX;
      const panned = window.scrollY > 0 || viewport.offsetTop > 0;
      if (pageFits && panned) window.scrollTo(0, 0);
    };

    const update = () => {
      const visibleHeight = viewport.height * viewport.scale;
      const keyboardOpen =
        window.innerHeight - visibleHeight > KEYBOARD_MIN_HEIGHT_PX;
      root.style.setProperty(VIEWPORT_HEIGHT_VAR, `${visibleHeight}px`);
      root.setAttribute(KEYBOARD_OPEN_ATTRIBUTE, String(keyboardOpen));
      resetStalePan();

      // A board that shrinks keeps its scrollTop, which can leave the tapped
      // caret below the new bottom edge until the user types.
      const shrank = visibleHeight < lastHeight;
      lastHeight = visibleHeight;
      const focused = document.activeElement;
      if (keyboardOpen && shrank && focused instanceof HTMLTextAreaElement)
        centerTextareaCaret(focused);
    };

    update();
    viewport.addEventListener(RESIZE_EVENT, update);
    viewport.addEventListener(SCROLL_EVENT, resetStalePan);
    window.addEventListener(SCROLL_EVENT, resetStalePan);
    return () => {
      viewport.removeEventListener(RESIZE_EVENT, update);
      viewport.removeEventListener(SCROLL_EVENT, resetStalePan);
      window.removeEventListener(SCROLL_EVENT, resetStalePan);
      root.style.removeProperty(VIEWPORT_HEIGHT_VAR);
      root.removeAttribute(KEYBOARD_OPEN_ATTRIBUTE);
    };
  }, []);
};
