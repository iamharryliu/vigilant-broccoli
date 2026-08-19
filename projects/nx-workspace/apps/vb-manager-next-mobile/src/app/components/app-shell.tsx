'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppSidebar } from './sidebar';
import { Topbar } from './topbar';

const CONTENT_PADDING =
  'pt-[var(--topbar-h)] md:pt-0 pl-0 md:pl-14 md:peer-hover:pl-48 transition-[padding] duration-200';

export const PAGE_MIN_HEIGHT =
  'min-h-[calc(100dvh-var(--topbar-h))] md:min-h-screen';
export const PAGE_HEIGHT = 'h-[calc(100dvh-var(--topbar-h))] md:h-screen';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === '/login') return <>{children}</>;

  return (
    <>
      <AppSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <Topbar onMenuClick={() => setSidebarOpen(open => !open)} />
      <div className={CONTENT_PADDING}>{children}</div>
    </>
  );
};
