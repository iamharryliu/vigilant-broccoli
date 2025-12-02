'use client';

import { ReactNode } from 'react';
import { NextNavBar } from '@vigilant-broccoli/next-lib';
import { IconButton } from '@radix-ui/themes';
import { APP_ROUTE } from '../app.const';
import { useTheme } from '../theme-context';

export default function Layout({ children }: { children: ReactNode }) {
  const { appearance, toggleTheme } = useTheme();

  return (
    <div className="w-full min-h-screen">
      <NextNavBar
        routes={Object.values(APP_ROUTE)}
        rightContent={
          <IconButton
            variant="soft"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {appearance === 'light' ? '🌙' : '☀️'}
          </IconButton>
        }
      />
      <main className="p-4">{children}</main>
    </div>
  );
}
