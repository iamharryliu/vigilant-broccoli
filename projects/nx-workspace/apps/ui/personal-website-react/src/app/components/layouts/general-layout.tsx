import { useState, type ReactNode } from 'react';
import { Mail, Calendar } from 'lucide-react';
import { LINKS } from '../../core/consts/routes.const';
import { SidebarNav } from '../features/sidebar-nav';
import { MobileTopbar } from '../features/mobile-topbar';
import { NavbarSection } from '../features/navbar-section';
import { ProfileCard } from '../features/profile-card';
import { IconActionLink } from '../global/icon-action-link';

export function GeneralLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <SidebarNav
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <MobileTopbar onMenuClick={() => setSidebarOpen(open => !open)} />
      <div className="lg:flex">
        <div className="hidden lg:block lg:h-screen lg:w-2/5 border-r-2 lg:pt-24 relative">
          <div className="flex items-center h-5/6">
            <div className="w-full">
              <div className="mb-6">
                <ProfileCard />
              </div>
              <div className="flex justify-center space-x-4">
                <IconActionLink
                  to={LINKS.CONTACT_PAGE.url.internal ?? '/'}
                  icon={Mail}
                  label="Contact"
                />
                <IconActionLink
                  to={LINKS.CALENDAR_PAGE.url.internal ?? '/'}
                  icon={Calendar}
                  label="Calendar"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:h-screen lg:overflow-y-scroll w-full lg:w-3/5 relative pt-[calc(var(--topbar-h)+1rem)] lg:pt-0">
          <NavbarSection />
          {children}
        </div>
      </div>
    </>
  );
}
