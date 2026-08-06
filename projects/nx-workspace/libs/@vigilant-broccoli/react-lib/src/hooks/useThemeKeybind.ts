'use client';

import { useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';

const TOGGLE_KEY = 'd';
const IGNORED_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

const isIgnoredInputElement = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (IGNORED_TAGS.includes(target.tagName) || target.isContentEditable);

const shouldIgnoreKeystroke = (e: KeyboardEvent): boolean =>
  isIgnoredInputElement(e.target) || e.ctrlKey || e.metaKey || e.altKey;

export function useThemeKeybind() {
  const { toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeystroke(e)) {
        return;
      }
      if (e.key.toLowerCase() === TOGGLE_KEY) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);
}
