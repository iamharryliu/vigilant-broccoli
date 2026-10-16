'use client';

import ReactMarkdown from 'react-markdown';
import { Button, Heading, useTheme } from '@vigilant-broccoli/react-lib';
import { Moon, Sun } from 'lucide-react';
import { KEYBOARD_SHORTCUTS_MARKDOWN } from '../../content/keyboard-shortcuts.md';

const LIGHT = 'light';
const DARK_MODE_LABEL = 'Dark mode';
const LIGHT_MODE_LABEL = 'Light mode';

export function SettingsPage() {
  const { appearance, toggleTheme } = useTheme();
  const isLight = appearance === LIGHT;

  return (
    <div className="w-full min-h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        <Heading size="8" mb="6">
          Settings
        </Heading>
        <Button
          variant="outline"
          onClick={toggleTheme}
          className="flex items-center gap-2 mb-6"
        >
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
          {isLight ? DARK_MODE_LABEL : LIGHT_MODE_LABEL}
        </Button>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{KEYBOARD_SHORTCUTS_MARKDOWN}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
