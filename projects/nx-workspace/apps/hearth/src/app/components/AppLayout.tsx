'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../providers/auth-provider';
import { TopbarSlotProvider } from '../providers/topbar-slot-provider';
import { ROUTES } from '../../lib/routes';
import {
  APP_CONTENT_ATTRIBUTE,
  useVisualViewportHeight,
} from '../../lib/use-visual-viewport-height';
import Topbar from './Topbar';
import Sidebar, { SIDEBAR_POSITION } from './Sidebar';

const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.AUTH_CALLBACK];
const SPINNER_DELAY_MS = 300;

/**
 * Frame-only stand-in for Topbar and Sidebar while auth resolves. It mirrors
 * their position, size and colors so the real chrome replaces it without a
 * layout shift; the real components stay unmounted until a session exists.
 */
function AuthLoadingFrame() {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(true), SPINNER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <aside
        aria-hidden
        className={`${SIDEBAR_POSITION} hidden md:block md:w-14 border-r border-border bg-background`}
      />
      <header
        aria-hidden
        className="fixed top-0 left-0 right-0 z-20 h-[var(--topbar-h)] border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
      />
      <div className="pt-[var(--topbar-h)] md:pl-14">
        {showSpinner && (
          <div className="flex justify-center pt-24">
            <div
              role="status"
              aria-label="Loading"
              className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-700 dark:border-t-gray-300"
            />
          </div>
        )}
      </div>
    </>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
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
    return <AuthLoadingFrame />;
  }

  const authenticated = session && !isPublic;

  if (!authenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <Topbar onMenuClick={() => setSidebarOpen(open => !open)} />
      <div
        {...{ [APP_CONTENT_ATTRIBUTE]: true }}
        className="pt-[var(--topbar-h)] pl-0 md:pl-14 md:peer-hover:pl-48 transition-[padding] duration-200"
      >
        {children}
      </div>
    </>
  );
}

/**
 * The slot provider wraps every branch, not just the authenticated one: pages
 * render their topbar tabs through `TopbarSlot` before auth resolves, and a
 * missing provider throws instead of simply rendering nothing.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  useVisualViewportHeight();
  return (
    <TopbarSlotProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </TopbarSlotProvider>
  );
}
