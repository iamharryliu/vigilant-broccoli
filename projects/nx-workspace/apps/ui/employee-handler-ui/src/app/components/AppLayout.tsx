'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import Sidebar from './Sidebar';

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

  if (!authenticated) return <>{children}</>;

  return (
    <>
      <Sidebar />
      <div className="pl-14 min-h-screen bg-background text-foreground">
        {children}
      </div>
    </>
  );
}
