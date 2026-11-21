'use client';

import { useEffect } from 'react';
import { shouldIgnoreShortcutKeystroke } from '../utils/keyboard-shortcut.utils';

const SLASH_KEY = '/';
const KEYDOWN_EVENT = 'keydown';

type FocusSearchShortcutOptions = {
  enabled?: boolean;
};

export function useFocusSearchShortcut(
  onFocusSearch: () => void,
  { enabled = true }: FocusSearchShortcutOptions = {},
) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== SLASH_KEY || shouldIgnoreShortcutKeystroke(e)) return;
      e.preventDefault();
      onFocusSearch();
    };

    window.addEventListener(KEYDOWN_EVENT, handleKeyDown);
    return () => window.removeEventListener(KEYDOWN_EVENT, handleKeyDown);
  }, [onFocusSearch, enabled]);
}
