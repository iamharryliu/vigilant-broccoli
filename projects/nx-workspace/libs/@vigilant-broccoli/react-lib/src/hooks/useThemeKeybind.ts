'use client';

import { useEffect } from 'react';
import { shouldIgnoreShortcutKeystroke } from '../utils/keyboard-shortcut.utils';

const TOGGLE_KEY = 'd';
const KEYDOWN_EVENT = 'keydown';

export function useToggleThemeKeybind(toggleTheme: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreShortcutKeystroke(e)) {
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
