import { Link, useLocation } from 'react-router-dom';
import type { ComponentProps } from 'react';
import { Calendar, Mail, User } from 'lucide-react';
import { Sidebar, type SidebarCTA } from '@vigilant-broccoli/react-lib';
import { LINKS } from '../../core/consts/routes.const';

const SIDEBAR_POSITION = 'peer fixed top-0 left-0 bottom-0 z-30';

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
      branding={{ label: 'Harry Liu', href: LINKS.INDEX_PAGE.url.internal }}
      LinkComponent={SidebarLink}
      className={SIDEBAR_POSITION}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}
