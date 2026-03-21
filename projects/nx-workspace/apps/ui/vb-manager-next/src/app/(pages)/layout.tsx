'use client';

import { ReactNode, useState, useEffect } from 'react';
import { NextNavBar, NextNavRoute } from '@vigilant-broccoli/next-lib';
import { DropdownMenu, Button } from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { APP_ROUTE } from '../app.const';
import { useTheme } from '../theme-context';
import { FloatingIslandComponent } from '../components/floating-island.component';

type ExtendedNavRoute = {
  title: string;
  path?: string;
  children?: NextNavRoute[];
};

const IGNORED_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

const isIgnoredInputElement = (target: EventTarget | null): boolean => {
  return target instanceof Element && IGNORED_TAGS.includes(target.tagName);
};

const shouldIgnoreKeystroke = (e: KeyboardEvent): boolean => {
  return isIgnoredInputElement(e.target) || e.ctrlKey || e.metaKey || e.altKey;
};

type KeyboardHandlers = {
  setSearchDialogOpen: (open: boolean) => void;
  setEmailDialogOpen: (open: boolean) => void;
  setChatbotDialogOpen: (open: boolean) => void;
  setCalendarDialogOpen: (open: boolean) => void;
  toggleTheme: () => void;
};

const processKeyboardInput = (
  key: string,
  isShift: boolean,
  handlers: KeyboardHandlers,
): boolean => {
  switch (key) {
    case '/':
      handlers.setSearchDialogOpen(true);
      return true;
    case 'm':
      handlers.setEmailDialogOpen(true);
      return true;
    case 'c':
      if (!isShift) {
        handlers.setChatbotDialogOpen(true);
        return true;
      }
      if (isShift) {
        handlers.setCalendarDialogOpen(true);
        return true;
      }
      return false;
    case 'd':
      handlers.toggleTheme();
      return true;
    default:
      return false;
  }
};

const handleKeyboardShortcut = (
  e: KeyboardEvent,
  handlers: KeyboardHandlers,
): void => {
  if (shouldIgnoreKeystroke(e)) {
    return;
  }

  if (processKeyboardInput(e.key.toLowerCase(), e.shiftKey, handlers)) {
    e.preventDefault();
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  const { appearance, toggleTheme } = useTheme();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [chatbotDialogOpen, setChatbotDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);

  const allRoutes = Object.values(APP_ROUTE) as ExtendedNavRoute[];
  const dropdownRoutes = allRoutes.filter(
    r => r.children && r.children.length > 0,
  );
  const tabRoutes = allRoutes.filter((r): r is NextNavRoute => !!r.path);

  const isActiveDropdown = (children?: NextNavRoute[]) => {
    return children?.some(child => child.path === pathname) ?? false;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyboardShortcut(e, {
        setSearchDialogOpen,
        setEmailDialogOpen,
        setChatbotDialogOpen,
        setCalendarDialogOpen,
        toggleTheme,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  return (
    <div className="w-full min-h-screen">
      <NextNavBar
        routes={tabRoutes}
        isDark={appearance === 'dark'}
        rightContent={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
            {session ? (
              <Button
                variant="soft"
                onClick={() => signOut()}
                style={{ cursor: 'pointer' }}
              >
                Sign Out
              </Button>
            ) : (
              <Button
                variant="soft"
                onClick={() => signIn('google')}
                style={{ cursor: 'pointer' }}
              >
                Sign In
              </Button>
            )}
          </div>
        }
      />
      <main className="p-4">{children}</main>
      <FloatingIslandComponent
        searchDialogOpen={searchDialogOpen}
        setSearchDialogOpen={setSearchDialogOpen}
        chatbotDialogOpen={chatbotDialogOpen}
        setChatbotDialogOpen={setChatbotDialogOpen}
        emailDialogOpen={emailDialogOpen}
        setEmailDialogOpen={setEmailDialogOpen}
        calendarDialogOpen={calendarDialogOpen}
        setCalendarDialogOpen={setCalendarDialogOpen}
      />
    </div>
  );
}
