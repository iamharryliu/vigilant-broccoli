import { Link, useLocation } from 'react-router-dom';
import type { ComponentProps } from 'react';
import { Calendar, Mail, User } from 'lucide-react';
import { Sidebar, type SidebarCTA } from '@vigilant-broccoli/react-lib';
import { LINKS } from '../../core/consts/routes.const';

// Mobile-only drawer: at lg+ the horizontal NavbarSection is the nav, so the
// aside is display:none instead of the rail react-lib would otherwise show.
const SIDEBAR_POSITION = 'lg:hidden fixed top-0 left-0 bottom-0 z-30';

const NAV_ITEMS: Omit<SidebarCTA, 'isActive'>[] = [
  {
    href: LINKS.ABOUT_PAGE.url.internal ?? '/',
    label: LINKS.ABOUT_PAGE.text,
    icon: User,
  },
  {
    href: LINKS.CALENDAR_PAGE.url.internal ?? '/',
    label: LINKS.CALENDAR_PAGE.text,
    icon: Calendar,
  },
  {
    href: LINKS.CONTACT_PAGE.url.internal ?? '/',
    label: LINKS.CONTACT_PAGE.text,
    icon: Mail,
  },
];

type RouterLinkProps = { href?: string } & Omit<
  ComponentProps<typeof Link>,
  'to'
>;

const SidebarLink = ({ href, ...rest }: RouterLinkProps) => (
  <Link to={href ?? '/'} {...rest} />
);

type Props = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function SidebarNav({ mobileOpen, onMobileClose }: Props) {
  const { pathname } = useLocation();

  const items: SidebarCTA[] = NAV_ITEMS.map(item => ({
    ...item,
    isActive: pathname === item.href,
  }));

  return (
    <Sidebar
      items={items}
      LinkComponent={SidebarLink}
      className={SIDEBAR_POSITION}
      mobileBreakpoint="lg"
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}
