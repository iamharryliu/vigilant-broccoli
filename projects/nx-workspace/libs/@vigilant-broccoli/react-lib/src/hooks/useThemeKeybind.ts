'use client';

import { useEffect } from 'react';

const TOGGLE_KEY = 'd';
const KEYDOWN_EVENT = 'keydown';
const IGNORED_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

const isIgnoredInputElement = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (IGNORED_TAGS.includes(target.tagName) || target.isContentEditable);

// `defaultPrevented` lets React handlers (dispatched from the root container,
// before this window listener) claim `d` for themselves.
const shouldIgnoreKeystroke = (e: KeyboardEvent): boolean =>
  e.defaultPrevented ||
  isIgnoredInputElement(e.target) ||
  e.ctrlKey ||
  e.metaKey ||
  e.altKey;

export function useToggleThemeKeybind(toggleTheme: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeystroke(e)) {
        return;
      }
      if (e.key.toLowerCase() === TOGGLE_KEY) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener(KEYDOWN_EVENT, handleKeyDown);
    return () => window.removeEventListener(KEYDOWN_EVENT, handleKeyDown);
  }, [toggleTheme, enabled]);
}
