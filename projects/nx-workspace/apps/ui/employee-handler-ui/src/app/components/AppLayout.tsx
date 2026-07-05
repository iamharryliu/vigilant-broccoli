'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import { I18nProvider } from '../i18n';
import Sidebar from './Sidebar';

const TOASTER_POSITION = 'top-right';

const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.AUTH_CALLBACK];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  useEffect(() => {
    if (!session && !isPublic) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (session && isPublic) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [session, isPublic, router]);

  const authenticated = session && !isPublic;

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
        {children}
      </div>
    </I18nProvider>
  );
}
