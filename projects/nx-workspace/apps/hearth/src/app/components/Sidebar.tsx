'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar as SharedSidebar, SidebarCTA } from '@vigilant-broccoli/react-lib';
import { NAV_LINKS } from '../app.consts';

const SIDEBAR_POSITION = 'fixed top-0 left-0 bottom-0 z-30';

export default function Sidebar() {
  const pathname = usePathname();

  const items: SidebarCTA[] = NAV_LINKS.map(
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

  return (
    <SharedSidebar
      items={items}
      LinkComponent={Link}
      searchable
      className={SIDEBAR_POSITION}
    />
  );
}
