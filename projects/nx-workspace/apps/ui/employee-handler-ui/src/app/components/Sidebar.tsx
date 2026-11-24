'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import {
  Sidebar as SharedSidebar,
  SidebarCTA,
} from '@vigilant-broccoli/sidebar';
import { getSupabase } from '../../../libs/supabase';
import { useAuth } from '../providers/auth-provider';
import { NAV_LINKS } from '../app.consts';
import { useTranslation } from '../i18n';

const SIDEBAR_POSITION = 'fixed top-0 left-0 bottom-0 z-30';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isDemo } = useAuth();

  const navItems: SidebarCTA[] = NAV_LINKS.map(({ labelKey, href, icon }) => ({
    label: t(labelKey),
    href,
    icon,
    isActive: pathname.startsWith(href),
  }));

  const logoutItem: SidebarCTA = {
    label: t('SIDEBAR.LOGOUT'),
    icon: LogOut,
    onClick: async () => {
      const supabase = await getSupabase();
      supabase.auth.signOut();
    },
  };

  // Demo visitors never signed in, so there is no session to log out of.
  const items = isDemo ? navItems : [...navItems, logoutItem];

  return (
    <SharedSidebar
      items={items}
      LinkComponent={Link}
      className={SIDEBAR_POSITION}
    />
  );
}
