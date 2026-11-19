'use client';

import ReactMarkdown from 'react-markdown';
import { Heading, ThemePreferenceControl } from '@vigilant-broccoli/react-lib';
import { KEYBOARD_SHORTCUTS_MARKDOWN } from '../../content/keyboard-shortcuts.md';

export function SettingsPage() {
  return (
    <div className="w-full min-h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        <Heading size="8" mb="6">
          Settings
        </Heading>
        <ThemePreferenceControl className="mb-6" />
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{KEYBOARD_SHORTCUTS_MARKDOWN}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
