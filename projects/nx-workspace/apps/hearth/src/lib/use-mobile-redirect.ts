'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NAV_LINKS } from '../app/app.consts';
import { useIsMobile } from './use-is-mobile';

export const getFirstMobileChildHref = (href: string) =>
  NAV_LINKS.find(link => link.href === href && link.mobileOnlyChildren)
    ?.children?.[0]?.href ?? null;

/**
 * Replaces desktop-only dashboards with their mobile counterpart. Gate the
 * page body on `shouldRender` so the dashboard neither flashes nor fetches
 * data before the redirect fires. `ready` waits for the client mount because
 * `useIsMobile` starts as `false` during SSR/first render.
 */
export const useMobileRedirect = (mobileHref: string | null) => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const redirecting = ready && isMobile && mobileHref !== null;

  useEffect(() => {
    if (redirecting && mobileHref) router.replace(mobileHref);
  }, [redirecting, mobileHref, router]);

  return { shouldRender: ready && !redirecting };
};
