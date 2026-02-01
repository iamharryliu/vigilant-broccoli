'use client';

import { ReactNode } from 'react';
import { NextNavBar } from '@vigilant-broccoli/next-lib';
import { IconButton, Select } from '@radix-ui/themes';
import { APP_ROUTE } from '../app.const';
import { useTheme } from '../theme-context';
import { useAppMode } from '../app-mode-context';
import { SearchDialogComponent } from '../components/search-dialog.component';
import { EmailModalComponent } from '../components/email-modal.component';

export default function Layout({ children }: { children: ReactNode }) {
  const { appearance, toggleTheme } = useTheme();
  const { appMode, setAppMode } = useAppMode();

  return (
    <div className="w-full min-h-screen">
      <NextNavBar
        routes={Object.values(APP_ROUTE)}
        isDark={appearance === 'dark'}
        rightContent={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <SearchDialogComponent />
            <EmailModalComponent />
            <Select.Root value={appMode} onValueChange={setAppMode}>
              <Select.Trigger placeholder="Select mode" />
              <Select.Content>
                <Select.Item value="personal">Personal</Select.Item>
                <Select.Item value="work">Work</Select.Item>
              </Select.Content>
            </Select.Root>
            <IconButton
              variant="soft"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {appearance === 'light' ? '🌙' : '☀️'}
            </IconButton>
          </div>
        }
      />
      <main className="p-4">{children}</main>
    </div>
  );
}
