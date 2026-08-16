import { AnchorHTMLAttributes } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar as SharedSidebar,
  SidebarCTA,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { NAV_LINKS, NavLink } from '../consts/navLinks';

const SIDEBAR_POSITION = 'peer fixed top-0 left-0 bottom-0 z-30';

type RouterLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

const RouterLink = ({ href, ...props }: RouterLinkProps) => (
  <Link to={href} {...props} />
);

const matchesHref = (href: string, pathname: string): boolean =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);

const isLinkActive = (link: NavLink, pathname: string): boolean =>
  (link.href ? matchesHref(link.href, pathname) : false) ||
  (link.children?.some(child => isLinkActive(child, pathname)) ?? false);

type SidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const toSidebarCTA = (link: NavLink): SidebarCTA => ({
    label: t(link.labelKey),
    href: link.href,
    icon: link.icon,
    isActive: isLinkActive(link, pathname),
    children: link.children?.map(toSidebarCTA),
  });

  const items: SidebarCTA[] = NAV_LINKS.map(toSidebarCTA);

  return (
    <SharedSidebar
      items={items}
      LinkComponent={RouterLink}
      className={SIDEBAR_POSITION}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}
