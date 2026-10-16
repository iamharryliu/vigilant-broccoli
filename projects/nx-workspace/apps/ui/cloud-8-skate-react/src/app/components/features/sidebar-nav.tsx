import type { ComponentProps } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sidebar, type SidebarCTA } from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../../i18n';
import { NAV_LINKS } from '../../core/consts/routes.const';

// Mobile-only drawer: at lg+ the horizontal NavbarSection is the nav, so the
// aside is display:none instead of the rail react-lib would otherwise show.
const SIDEBAR_POSITION = 'lg:hidden fixed top-0 left-0 bottom-0 z-30';

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
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const items: SidebarCTA[] = NAV_LINKS.map(link => ({
    href: link.to,
    label: t(link.labelKey),
    isActive: pathname === link.to,
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
