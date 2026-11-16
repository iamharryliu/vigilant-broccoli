'use client';

import { RefObject, useEffect } from 'react';
import {
  OPEN_DIALOG_SELECTOR,
  shouldIgnoreShortcutKeystroke,
} from '../utils/keyboard-shortcut.utils';

const SLASH_KEY = '/';
const FIND_KEY = 'f';
const KEYDOWN_EVENT = 'keydown';

type FocusSearchShortcutOptions = {
  enabled?: boolean;
  searchRef?: RefObject<HTMLElement | null>;
};

const isFindKeystroke = (e: KeyboardEvent): boolean =>
  (e.metaKey || e.ctrlKey) &&
  !e.altKey &&
  !e.shiftKey &&
  e.key.toLowerCase() === FIND_KEY;

// A dialog that contains the search element is the search itself, so it
// does not block the shortcut.
const isOtherDialogOpen = (searchElement: HTMLElement | null): boolean =>
  Array.from(document.querySelectorAll(OPEN_DIALOG_SELECTOR)).some(
    dialog => !searchElement || !dialog.contains(searchElement),
  );

// Cmd/Ctrl+F is claimed from any field, but not from the search input itself,
// so a second press reaches the browser's native find.
const shouldIgnoreFindKeystroke = (
  e: KeyboardEvent,
  searchElement: HTMLElement | null,
): boolean =>
  e.defaultPrevented ||
  e.isComposing ||
  (searchElement !== null && document.activeElement === searchElement) ||
  isOtherDialogOpen(searchElement);

export function useFocusSearchShortcut(
  onFocusSearch: () => void,
  { enabled = true, searchRef }: FocusSearchShortcutOptions = {},
) {
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const searchElement = searchRef?.current ?? null;
      const matches = isFindKeystroke(e)
        ? !shouldIgnoreFindKeystroke(e, searchElement)
        : e.key === SLASH_KEY && !shouldIgnoreShortcutKeystroke(e);
      if (!matches) return;
      e.preventDefault();
      onFocusSearch();
    };

    window.addEventListener(KEYDOWN_EVENT, handleKeyDown);
    return () => window.removeEventListener(KEYDOWN_EVENT, handleKeyDown);
  }, [onFocusSearch, enabled, searchRef]);
}
