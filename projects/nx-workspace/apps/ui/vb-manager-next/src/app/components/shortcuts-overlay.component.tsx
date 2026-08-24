'use client';

import ReactMarkdown from 'react-markdown';
import { KEYBOARD_SHORTCUTS_MARKDOWN } from '../content/keyboard-shortcuts.md';

type Props = {
  open: boolean;
};

export const ShortcutsOverlay = ({ open }: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none">
      <div className="max-w-md w-full mx-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-xl p-6 prose prose-sm dark:prose-invert">
        <ReactMarkdown>{KEYBOARD_SHORTCUTS_MARKDOWN}</ReactMarkdown>
      </div>
    </div>
  );
};
