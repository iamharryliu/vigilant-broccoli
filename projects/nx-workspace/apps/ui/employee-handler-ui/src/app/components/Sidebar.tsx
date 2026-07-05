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
import { NAV_LINKS } from '../app.consts';
import { useTranslation } from '../i18n';

const DARK = 'dark';
const SIDEBAR_POSITION = 'fixed top-0 left-0 bottom-0 z-30';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { appearance, toggleTheme } = useTheme();
  const isDark = appearance === DARK;

  const navItems: SidebarCTA[] = NAV_LINKS.map(({ labelKey, href, icon }) => ({
    label: t(labelKey),
    href,
    icon,
    isActive: pathname.startsWith(href),
  }));

  const themeItem: SidebarCTA = {
    label: isDark ? t('SIDEBAR.LIGHT_MODE') : t('SIDEBAR.DARK_MODE'),
    icon: isDark ? Sun : Moon,
    onClick: toggleTheme,
  };

  const logoutItem: SidebarCTA = {
    label: t('SIDEBAR.LOGOUT'),
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
      className={SIDEBAR_POSITION}
    />
  );
}
