'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isPhoneUserAgent } from '@vigilant-broccoli/common-browser';
import { KeyboardAccessoryToolbar } from '@vigilant-broccoli/react-lib';
import { AppSidebar } from './sidebar';
import { Topbar } from './topbar';

const CONTENT_PADDING =
  'pt-[var(--topbar-h)] md:pt-0 pl-0 md:pl-14 md:peer-hover:pl-48 transition-[padding] duration-200';

const useIsPhoneBrowser = () => {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    setIsPhone(isPhoneUserAgent(navigator.userAgent));
  }, []);

  return isPhone;
};

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isPhone = useIsPhoneBrowser();

  if (pathname === '/login') return <>{children}</>;

  return (
    <>
      <AppSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <Topbar onMenuClick={() => setSidebarOpen(open => !open)} />
      <div className={CONTENT_PADDING}>{children}</div>
      {isPhone && <KeyboardAccessoryToolbar />}
    </>
  );
};
