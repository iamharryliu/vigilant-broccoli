'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar as SharedSidebar, SidebarCTA } from '@vigilant-broccoli/react-lib';
import { NAV_LINKS, NavLink } from '../app.consts';

const SIDEBAR_POSITION = 'fixed top-0 left-0 bottom-0 z-30';

const isLinkActive = (link: NavLink, pathname: string): boolean =>
  (link.href ? pathname.startsWith(link.href) : false) ||
  (link.children?.some(child => isLinkActive(child, pathname)) ?? false);

const toSidebarCTA = (link: NavLink, pathname: string): SidebarCTA => ({
  label: link.label,
  href: link.href,
  icon: link.icon,
  isActive: isLinkActive(link, pathname),
  children: link.children?.map(child => toSidebarCTA(child, pathname)),
});

export default function Sidebar() {
  const pathname = usePathname();

  const items: SidebarCTA[] = NAV_LINKS.map(link =>
    toSidebarCTA(link, pathname),
  );

  return (
    <SharedSidebar
      items={items}
      LinkComponent={Link}
      searchable
      className={SIDEBAR_POSITION}
    />
  );
}
