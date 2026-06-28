'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import {
  Sidebar as SharedSidebar,
  SidebarCTA,
  useTheme,
} from '@vigilant-broccoli/react-lib';
import { NAV_LINKS } from '../app.consts';
import { ROUTES } from '../../lib/routes';

const LIGHT_MODE_LABEL = 'Light mode';
const DARK_MODE_LABEL = 'Dark mode';
const DARK = 'dark';
const SIDEBAR_POSITION = 'fixed top-0 left-0 bottom-0 z-30';

export default function Sidebar() {
  const pathname = usePathname();
  const { appearance, toggleTheme } = useTheme();
  const isDark = appearance === DARK;

  const navItems: SidebarCTA[] = NAV_LINKS.map(
    ({ label, href, icon, children }) => ({
      label,
      href,
      icon,
      isActive:
        pathname.startsWith(href) ||
        (children?.some(c => pathname.startsWith(c.href)) ?? false),
      children: children?.map(c => ({
        label: c.label,
        href: c.href,
        isActive: pathname.startsWith(c.href),
      })),
    }),
  );

  const themeItem: SidebarCTA = {
    label: isDark ? LIGHT_MODE_LABEL : DARK_MODE_LABEL,
    icon: isDark ? Sun : Moon,
    onClick: toggleTheme,
  };

  const settingsIdx = navItems.findIndex(i => i.href === ROUTES.SETTINGS);
  const items =
    settingsIdx >= 0
      ? [
          ...navItems.slice(0, settingsIdx),
          themeItem,
          ...navItems.slice(settingsIdx),
        ]
      : [...navItems, themeItem];

  return (
    <SharedSidebar
      items={items}
      LinkComponent={Link}
      searchable
      className={SIDEBAR_POSITION}
    />
  );
}
