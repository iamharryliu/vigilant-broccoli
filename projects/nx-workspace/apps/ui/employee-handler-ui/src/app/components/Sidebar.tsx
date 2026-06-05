'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Moon, Sun } from 'lucide-react';
import {
  Sidebar as SharedSidebar,
  SidebarCTA,
  useTheme,
} from '@vigilant-broccoli/react-lib';
import { supabase } from '../../../libs/supabase';
import { APP_LABEL, NAV_LINKS } from '../app.consts';
import { ROUTES } from '../../lib/routes';

const LIGHT_MODE_LABEL = 'Light mode';
const DARK_MODE_LABEL = 'Dark mode';
const LOGOUT_LABEL = 'Logout';
const DARK = 'dark';
const SIDEBAR_POSITION = 'fixed top-0 left-0 bottom-0 z-30';

export default function Sidebar() {
  const pathname = usePathname();
  const { appearance, toggleTheme } = useTheme();
  const isDark = appearance === DARK;

  const navItems: SidebarCTA[] = NAV_LINKS.map(({ label, href, icon }) => ({
    label,
    href,
    icon,
    isActive: pathname.startsWith(href),
  }));

  const themeItem: SidebarCTA = {
    label: isDark ? LIGHT_MODE_LABEL : DARK_MODE_LABEL,
    icon: isDark ? Sun : Moon,
    onClick: toggleTheme,
  };

  const logoutItem: SidebarCTA = {
    label: LOGOUT_LABEL,
    icon: LogOut,
    onClick: () => {
      supabase.auth.signOut();
    },
  };

  const items = [...navItems, themeItem, logoutItem];

  return (
    <SharedSidebar
      items={items}
      LinkComponent={Link}
      branding={{ label: APP_LABEL, href: ROUTES.DASHBOARD }}
      className={SIDEBAR_POSITION}
    />
  );
}
