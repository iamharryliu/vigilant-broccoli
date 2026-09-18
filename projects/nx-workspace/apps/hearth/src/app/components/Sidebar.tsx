'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House } from 'lucide-react';
import {
  Sidebar as SharedSidebar,
  SidebarCTA,
} from '@vigilant-broccoli/react-lib';
import { NAV_LINKS, NavLink } from '../app.consts';
import { useHome } from '../providers/home-provider';
import { useIsMobile } from '../../lib/use-is-mobile';
import { ROUTES } from '../../lib/routes';

const NO_HOME_LABEL = 'No home selected';

const SIDEBAR_POSITION = 'peer fixed top-0 left-0 bottom-0 z-30';

const matchesHref = (href: string, pathname: string): boolean =>
  href === ROUTES.HOME ? pathname === ROUTES.HOME : pathname.startsWith(href);

const isLinkActive = (link: NavLink, pathname: string): boolean =>
  (link.href ? matchesHref(link.href, pathname) : false) ||
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
  const { homes, selectedHomeId } = useHome();

  const items: SidebarCTA[] = NAV_LINKS.map(link =>
    toSidebarCTA(link, pathname, isMobile),
  );

  // Every nav destination reads the active home from the provider, so naming it
  // here is what makes the sidebar's scope visible rather than implicit.
  const selectedHome = homes.find(home => home.id === selectedHomeId);

  return (
    <SharedSidebar
      items={items}
      branding={{
        label: selectedHome?.name ?? NO_HOME_LABEL,
        icon: House,
        href: ROUTES.SETTINGS,
      }}
      LinkComponent={Link}
      searchable
      className={SIDEBAR_POSITION}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}
