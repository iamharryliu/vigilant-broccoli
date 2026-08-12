'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@radix-ui/themes';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.AUTH_CALLBACK];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));
  const isLoading = session === undefined;

  useEffect(() => {
    if (isLoading) return;

    if (!session && !isPublic) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (session && isPublic) {
      router.replace(ROUTES.HOME);
    }
  }, [session, isPublic, isLoading, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="pt-[49px] px-6">
        <Skeleton className="h-8 w-48 mt-4" />
        <Skeleton className="h-4 w-full mt-3" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </div>
    );
  }

  const authenticated = session && !isPublic;

  if (!authenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <Topbar onMenuClick={() => setSidebarOpen(open => !open)} />
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <div className="pt-[49px] pl-0 md:pl-14 md:peer-hover:pl-48 transition-[padding] duration-200">
        {children}
      </div>
    </>
  );
}
