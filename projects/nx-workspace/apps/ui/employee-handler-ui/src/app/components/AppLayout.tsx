'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from '@vigilant-broccoli/react-lib/toaster';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import { I18nProvider } from '../i18n';
import Sidebar from './Sidebar';
import DemoBanner from './DemoBanner';

const TOASTER_POSITION = 'top-right';

const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.AUTH_CALLBACK];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, isDemo } = useAuth();
  const signedIn = isDemo || !!session;
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  useEffect(() => {
    if (!signedIn && !isPublic) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (signedIn && isPublic) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [signedIn, isPublic, router]);

  const authenticated = signedIn && !isPublic;

  if (!authenticated) {
    return (
      <I18nProvider>
        <Toaster richColors closeButton position={TOASTER_POSITION} />
        {children}
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <Toaster richColors closeButton position={TOASTER_POSITION} />
      <Sidebar />
      <div className="pl-14 min-h-screen bg-background text-foreground">
        {isDemo && <DemoBanner />}
        {children}
      </div>
    </I18nProvider>
  );
}
