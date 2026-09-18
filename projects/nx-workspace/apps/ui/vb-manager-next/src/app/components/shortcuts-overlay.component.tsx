'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { KEYBOARD_SHORTCUTS_MARKDOWN } from '../content/keyboard-shortcuts.md';

type Props = {
  open: boolean;
};

// Keep in sync with the `duration-150` in FADE_CLASS below - it's the JS
// mirror of that CSS duration, used to delay unmounting until the
// fade-out transition finishes.
const FADE_DURATION_MS = 150;
const FADE_CLASS = 'transition-opacity duration-150 ease-out';

export const ShortcutsOverlay = ({ open }: Props) => {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timeout = setTimeout(() => setMounted(false), FADE_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none ${FADE_CLASS} ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-md w-full mx-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl p-6 prose prose-sm dark:prose-invert">
        <ReactMarkdown>{KEYBOARD_SHORTCUTS_MARKDOWN}</ReactMarkdown>
      </div>
    </div>
  );
};
