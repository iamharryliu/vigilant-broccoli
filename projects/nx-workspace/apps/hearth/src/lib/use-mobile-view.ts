'use client';

import { ComponentType, useEffect, useState } from 'react';
import { NAV_LINKS } from '../app/app.consts';
import { MOBILE_VIEWS } from '../app/mobile-views';
import { useIsMobile } from './use-is-mobile';

export const getFirstMobileChildHref = (href: string) =>
  NAV_LINKS.find(link => link.href === href && link.mobileOnlyChildren)
    ?.children?.[0]?.href ?? null;

/**
 * `ready` waits for the client mount because `useIsMobile` starts as `false`
 * during SSR/first render. Render nothing until it is true so neither view
 * flashes or fetches before the choice is made.
 */
export const useMobileReady = () => {
  const isMobile = useIsMobile();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return { ready, isMobile };
};

/**
 * Renders a desktop-only dashboard's mobile default child in place, without
 * navigating. `MobileView` is null on desktop.
 */
export const useMobileView = (
  parentHref: string,
): { ready: boolean; MobileView: ComponentType | null } => {
  const { ready, isMobile } = useMobileReady();
  const childHref = getFirstMobileChildHref(parentHref);
  const MobileView =
    ready && isMobile && childHref ? (MOBILE_VIEWS[childHref] ?? null) : null;
  return { ready, MobileView };
};
