'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar as SharedSidebar,
  SidebarCTA,
} from '@vigilant-broccoli/react-lib-higher-level';
import { NAV_LINKS, NavLink } from '../app.consts';
import { useIsMobile } from '../../lib/use-is-mobile';
import { ROUTES } from '../../lib/routes';
import { getFirstMobileChildHref } from '../../lib/use-mobile-view';

export const SIDEBAR_POSITION = 'peer fixed top-0 left-0 bottom-0 z-30';

const matchesHref = (href: string, pathname: string): boolean =>
  href === ROUTES.HOME ? pathname === ROUTES.HOME : pathname.startsWith(href);

const isMobileDefaultChild = (
  link: NavLink,
  parent: NavLink | undefined,
  pathname: string,
  isMobile: boolean,
): boolean =>
  isMobile &&
  !!parent?.href &&
  pathname === parent.href &&
  link.href === getFirstMobileChildHref(parent.href);

// On mobile the parent URL renders its default child in place, so that child
// must read as active even though its own href is not the current path.
const isLinkActive = (
  link: NavLink,
  pathname: string,
  isMobile: boolean,
  parent?: NavLink,
): boolean =>
  (link.href ? matchesHref(link.href, pathname) : false) ||
  isMobileDefaultChild(link, parent, pathname, isMobile) ||
  (link.children?.some(child =>
    isLinkActive(child, pathname, isMobile, link),
  ) ??
    false);

const toSidebarCTA = (
  link: NavLink,
  pathname: string,
  isMobile: boolean,
  parent?: NavLink,
): SidebarCTA => {
  const includeChildren =
    link.children && (isMobile || !link.mobileOnlyChildren);
  return {
    label: link.label,
    href: link.href,
    icon: link.icon,
    isActive: isLinkActive(link, pathname, isMobile, parent),
    children: includeChildren
      ? link.children?.map(child =>
          toSidebarCTA(child, pathname, isMobile, link),
        )
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
