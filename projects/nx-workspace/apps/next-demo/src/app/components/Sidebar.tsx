'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar as SharedSidebar,
  SidebarCTA,
} from '@vigilant-broccoli/react-lib';
import { NAV_LINKS } from '../app.consts';
import { ROUTES } from '../../lib/routes';

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
      branding={{ label: 'next-demo', href: ROUTES.HOME }}
      className="fixed top-0 left-0 bottom-0 z-30"
    />
  );
}
