'use client';

import { ReactNode, useState, useEffect } from 'react';
import { NextNavBar, NextNavRoute } from '@vigilant-broccoli/next-lib';
import { IconButton, Select, DropdownMenu, Button } from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { APP_ROUTE } from '../app.const';
import { useTheme } from '../theme-context';
import { useAppMode } from '../app-mode-context';
import { SearchDialogComponent } from '../components/search-dialog.component';
import { EmailModalComponent } from '../components/email-modal.component';
import { ChatbotDialog } from '../components/chatbot-dialog.component';

type ExtendedNavRoute = {
  title: string;
  path?: string;
  children?: NextNavRoute[];
};

const IGNORED_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

export default function Layout({ children }: { children: ReactNode }) {
  const { appearance, toggleTheme } = useTheme();
  const { appMode, setAppMode } = useAppMode();
  const pathname = usePathname();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const allRoutes = Object.values(APP_ROUTE) as ExtendedNavRoute[];
  const dropdownRoutes = allRoutes.filter(r => r.children && r.children.length > 0);
  const tabRoutes = allRoutes.filter((r): r is NextNavRoute => !!r.path);

  const isActiveDropdown = (children?: NextNavRoute[]) => {
    return children?.some(child => child.path === pathname) ?? false;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && e.target instanceof Element && !IGNORED_TAGS.includes(e.target.tagName)) {
        e.preventDefault();
        setSearchDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full min-h-screen">
      <NextNavBar
        routes={tabRoutes}
        isDark={appearance === 'dark'}
        rightContent={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <SearchDialogComponent open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />
            <EmailModalComponent />
            <Button
              variant="soft"
              onClick={() => setChatbotOpen(true)}
              aria-label="Open chatbot"
            >
              Jarvis
            </Button>
            {dropdownRoutes.map(obj => (
              <DropdownMenu.Root key={obj.title}>
                <DropdownMenu.Trigger>
                  <Button
                    variant="ghost"
                    style={{
                      cursor: 'pointer',
                      color: isActiveDropdown(obj.children)
                        ? 'var(--accent-9)'
                        : 'inherit',
                      fontWeight: isActiveDropdown(obj.children) ? 500 : 400,
                    }}
                  >
                    {obj.title}
                    <DropdownMenu.TriggerIcon />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  {obj.children?.map(child => (
                    <DropdownMenu.Item key={child.path} asChild>
                      <Link href={child.path ?? '#'}>{child.title}</Link>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ))}
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
      <ChatbotDialog open={chatbotOpen} onOpenChange={setChatbotOpen} />
    </div>
  );
}
