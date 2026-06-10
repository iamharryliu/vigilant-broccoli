import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ENVIRONMENT } from '../../../environments/environment';
import { LINKS } from '../../core/consts/routes.const';
import { NavbarSection } from '../features/navbar-section';
import { ProfileCard } from '../features/profile-card';
import { ToggleDarkModeButton } from '../features/toggle-dark-mode-button';

export function GeneralLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavbarSection className="lg:hidden" />
      <div className="lg:flex">
        <div className="h-min lg:h-screen w-full lg:w-2/5 border-r-2 lg:pt-24 pt-16 relative">
          <div className="flex items-center h-fit lg:h-5/6">
            <div className="w-full">
              <div className="mb-6">
                <ProfileCard />
              </div>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://github.com/iamharryliu"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-all duration-200 hover:scale-110 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <i className="fa-brands fa-github fa-xl" />
                </a>
                <a
                  href="https://www.linkedin.com/in/iamharryliu/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-all duration-200 hover:scale-110 hover:text-blue-700 dark:hover:text-blue-500"
                >
                  <i className="fa-brands fa-linkedin fa-xl" />
                </a>
                <Link
                  to={LINKS.CONTACT_PAGE.url.internal ?? '/'}
                  className="transition-all duration-200 hover:scale-110 hover:text-blue-600 dark:hover:text-blue-400"
                  aria-label="Contact"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </Link>
                <a
                  href={LINKS.LINK_TREE.url.external}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-all duration-200 hover:scale-110 hover:text-blue-600 dark:hover:text-blue-400"
                  aria-label="Link tree"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </a>
                <Link
                  to={LINKS.CALENDAR_PAGE.url.internal ?? '/'}
                  className="transition-all duration-200 hover:scale-110 hover:text-blue-600 dark:hover:text-blue-400"
                  aria-label="Calendar"
                >
                  <i className="fa-solid fa-calendar fa-xl" />
                </Link>
                {ENVIRONMENT.JOB_HUNT_MODE ? (
                  <a
                    href="https://www.linkedin.com/in/iamharryliu/"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-all duration-200 hover:scale-110 hover:text-blue-700 dark:hover:text-blue-500"
                  >
                    <i className="fa-brands fa-linkedin fa-xl" />
                  </a>
                ) : null}
                <ToggleDarkModeButton />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:h-screen lg:overflow-y-scroll w-full lg:w-3/5 relative">
          <NavbarSection className="invisible lg:visible" />
          <div>{children}</div>
        </div>
      </div>
    </>
  );
}
