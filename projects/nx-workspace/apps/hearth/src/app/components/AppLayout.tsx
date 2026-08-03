'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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

  useEffect(() => {
    if (!session && !isPublic) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (session && isPublic) {
      router.replace(ROUTES.HOME);
    }
  }, [session, isPublic, router]);

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
      <div className="pt-[49px] pl-0 md:pl-14">{children}</div>
    </>
  );
}
