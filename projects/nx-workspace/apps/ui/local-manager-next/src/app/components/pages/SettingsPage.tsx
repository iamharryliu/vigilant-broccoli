'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Heading,
  SignOutButton,
  ThemePreferenceControl,
} from '@vigilant-broccoli/react-lib';
import { signOut, useAuth } from '../../../../libs/auth';
import { KEYBOARD_SHORTCUTS_MARKDOWN } from '../../content/keyboard-shortcuts.md';

const SECTION_DIVIDER_CLASSES = 'my-6 border-gray-200 dark:border-gray-800';

export function SettingsPage() {
  const session = useAuth();

  return (
    <div className="w-full min-h-screen">
      <div className="p-6 max-w-4xl mx-auto">
        <Heading size="8" mb="6">
          Settings
        </Heading>
        <section>
          <Heading as="h2" size="5" mb="3">
            Appearance
          </Heading>
          <ThemePreferenceControl />
        </section>
        <hr className={SECTION_DIVIDER_CLASSES} />
        <section>
          <Heading as="h2" size="5" mb="3">
            Keyboard Shortcuts
          </Heading>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {/* The section header above replaces the markdown's own title, which the hold-? overlay still shows. */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              disallowedElements={['h1']}
            >
              {KEYBOARD_SHORTCUTS_MARKDOWN}
            </ReactMarkdown>
          </div>
        </section>
        {session && (
          <>
            <hr className={SECTION_DIVIDER_CLASSES} />
            <section>
              <Heading as="h2" size="5" mb="3">
                Account
              </Heading>
              <SignOutButton onClick={() => signOut()} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
