'use client';

import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import './global.css';
import { useState } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const toggleTheme = () => {
    const next = appearance === 'light' ? 'dark' : 'light';
    setAppearance(next);
    localStorage.setItem('theme', next);
  };

  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  return (
    <html lang="en">
      <body>
        <Theme appearance={appearance}>
          <button
            onClick={toggleTheme}
            style={{ position: 'fixed', top: 10, right: 10 }}
          >
            Toggle theme
          </button>
          {children}
        </Theme>
      </body>
    </html>
  );
}
