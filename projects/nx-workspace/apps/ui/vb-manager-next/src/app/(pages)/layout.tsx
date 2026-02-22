'use client';

import { ReactNode } from 'react';
import { NextNavBar, NextNavRoute } from '@vigilant-broccoli/next-lib';
import { DropdownMenu, Button } from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { APP_ROUTE } from '../app.const';
import { useTheme } from '../theme-context';
import { FloatingIslandComponent } from '../components/floating-island.component';

type ExtendedNavRoute = {
  title: string;
  path?: string;
  children?: NextNavRoute[];
};

export default function Layout({ children }: { children: ReactNode }) {
  const { appearance } = useTheme();
  const pathname = usePathname();

  const allRoutes = Object.values(APP_ROUTE) as ExtendedNavRoute[];
  const dropdownRoutes = allRoutes.filter(
    r => r.children && r.children.length > 0,
  );
  const tabRoutes = allRoutes.filter((r): r is NextNavRoute => !!r.path);

  const isActiveDropdown = (children?: NextNavRoute[]) => {
    return children?.some(child => child.path === pathname) ?? false;
  };

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
          </div>
        }
      />
      <main className="p-4">{children}</main>
      <FloatingIslandComponent />
    </div>
  );
}
