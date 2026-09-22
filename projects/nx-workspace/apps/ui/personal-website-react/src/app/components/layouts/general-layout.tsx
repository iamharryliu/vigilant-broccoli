import { useState, type ReactNode } from 'react';
import {
  Github,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Calendar,
  Sun,
  Moon,
} from 'lucide-react';
import { LINKS } from '../../core/consts/routes.const';
import { useTheme } from '../../core/services/theme-context';
import { SidebarNav } from '../features/sidebar-nav';
import { MobileTopbar } from '../features/mobile-topbar';
import { ProfileCard } from '../features/profile-card';
import { IconActionLink } from '../global/icon-action-link';

const DARK_MODE_LABELS = {
  toLight: 'Switch to light mode',
  toDark: 'Switch to dark mode',
} as const;

const CONTENT_PADDING =
  'pl-0 md:pl-14 md:peer-hover:pl-48 transition-[padding] duration-200';

export function GeneralLayout({ children }: { children: ReactNode }) {
  const { isDark, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <SidebarNav
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <MobileTopbar onMenuClick={() => setSidebarOpen(open => !open)} />
      <div className={CONTENT_PADDING}>
        <div className="lg:flex">
          <div className="h-min lg:h-screen w-full lg:w-2/5 border-r-2 lg:pt-24 pt-[calc(var(--topbar-h)+1rem)] relative">
            <div className="flex items-center h-fit lg:h-5/6">
              <div className="w-full">
                <div className="mb-6">
                  <ProfileCard />
                </div>
                <div className="flex justify-center space-x-4">
                  <IconActionLink
                    href="https://github.com/iamharryliu"
                    icon={Github}
                    label="GitHub"
                    variant="brand"
                  />
                  <IconActionLink
                    href="https://www.linkedin.com/in/iamharryliu/"
                    icon={Linkedin}
                    label="LinkedIn"
                    variant="brand"
                  />
                  <IconActionLink
                    to={LINKS.CONTACT_PAGE.url.internal ?? '/'}
                    icon={Mail}
                    label="Contact"
                  />
                  <IconActionLink
                    href={LINKS.LINK_TREE.url.external ?? '/'}
                    icon={LinkIcon}
                    label="Link tree"
                  />
                  <IconActionLink
                    to={LINKS.CALENDAR_PAGE.url.internal ?? '/'}
                    icon={Calendar}
                    label="Calendar"
                  />
                  <IconActionLink
                    icon={isDark ? Sun : Moon}
                    label={
                      isDark
                        ? DARK_MODE_LABELS.toLight
                        : DARK_MODE_LABELS.toDark
                    }
                    onClick={toggleDarkMode}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:h-screen lg:overflow-y-scroll w-full lg:w-3/5 relative pt-[calc(var(--topbar-h)+1rem)] lg:pt-24">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
