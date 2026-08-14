'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar as SharedSidebar,
  SidebarCTA,
} from '@vigilant-broccoli/react-lib';
import { NAV_LINKS, NavLink } from '../app.consts';

const SIDEBAR_POSITION = 'peer fixed top-0 left-0 bottom-0 z-30';
const MOBILE_QUERY = '(max-width: 767px)';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isMobile;
};

const isLinkActive = (link: NavLink, pathname: string): boolean =>
  (link.href ? pathname.startsWith(link.href) : false) ||
  (link.children?.some(child => isLinkActive(child, pathname)) ?? false);

const toSidebarCTA = (
  link: NavLink,
  pathname: string,
  isMobile: boolean,
): SidebarCTA => {
  const includeChildren =
    link.children && (isMobile || !link.mobileOnlyChildren);
  return {
    label: link.label,
    href: link.href,
    icon: link.icon,
    isActive: isLinkActive(link, pathname),
    children: includeChildren
      ? link.children?.map(child => toSidebarCTA(child, pathname, isMobile))
      : undefined,
  };
};

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const items: SidebarCTA[] = NAV_LINKS.map(link =>
    toSidebarCTA(link, pathname, isMobile),
  );

  return (
    <SharedSidebar
      items={items}
      LinkComponent={Link}
      searchable
      className={SIDEBAR_POSITION}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}
