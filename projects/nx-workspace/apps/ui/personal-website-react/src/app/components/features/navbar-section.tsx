import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LINKS } from '../../core/consts/routes.const';

const NAV_LINKS = [LINKS.ABOUT_PAGE, LINKS.CALENDAR_PAGE];

const activeClass = 'text-blue-600 dark:text-blue-400 font-semibold';

const linkClass =
  "text-sm relative py-1 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-200 hover:after:w-full";

const mobileLinkClass =
  'text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700';

type Props = {
  className?: string;
};

export function NavbarSection({ className = '' }: Props) {
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={className}>
      <nav className="hidden lg:block sticky top-0 bg-inherit transition-opacity duration-500">
        <div className="flex items-center h-16 ml-6 space-x-6">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.text}
              to={link.url.internal ?? '/'}
              className={({ isActive }) =>
                isActive ? `${linkClass} ${activeClass}` : linkClass
              }
            >
              {link.text}
            </NavLink>
          ))}
        </div>
        <hr />
      </nav>

      <div className="lg:hidden bg-white dark:bg-gray-900 sticky top-0 z-10 transition-opacity duration-500">
        <div className="flex justify-between ml-4 mr-8 pt-3 pb-3">
          <div />
          <button
            onClick={() => setMobileNavOpen(open => !open)}
            className="text-gray-600 dark:text-gray-300 focus:outline-none"
            aria-label="Toggle navigation"
          >
            <i className="fas fa-bars" />
          </button>
        </div>
        <div
          className={`absolute w-full bg-gray-100 dark:bg-gray-800 pt-3 pb-3 ${
            isMobileNavOpen ? '' : 'hidden'
          }`}
        >
          <div className="space-y-1">
            {NAV_LINKS.map(link => (
              <div key={link.text} className="flex justify-center">
                <NavLink
                  to={link.url.internal ?? '/'}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? `${mobileLinkClass} ${activeClass}`
                      : mobileLinkClass
                  }
                >
                  {link.text}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
        <hr />
      </div>
    </div>
  );
}
