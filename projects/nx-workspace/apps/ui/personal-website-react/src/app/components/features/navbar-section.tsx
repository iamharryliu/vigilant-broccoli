import { NavLink } from 'react-router-dom';
import { Calendar, Mail, Moon, Sun, User } from 'lucide-react';
import { LINKS } from '../../core/consts/routes.const';
import { DARK_MODE_LABELS, useTheme } from '../../core/services/theme-context';
import { IconActionLink } from '../global/icon-action-link';

const NAV_LINKS = [
  { ...LINKS.ABOUT_PAGE, icon: User },
  { ...LINKS.CALENDAR_PAGE, icon: Calendar },
  { ...LINKS.CONTACT_PAGE, icon: Mail },
];

const NAV_ICON_SIZE = 16;

const activeClass = 'text-blue-600 dark:text-blue-400 font-semibold';

const linkClass =
  "text-sm relative py-1 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-200 hover:after:w-full";

export function NavbarSection() {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <nav className="hidden lg:block sticky top-0 bg-inherit transition-opacity duration-500">
      <div className="flex items-center justify-between h-16 mx-6">
        <div className="flex items-center space-x-6">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.text}
              to={link.url.internal ?? '/'}
              className={({ isActive }) =>
                isActive ? `${linkClass} ${activeClass}` : linkClass
              }
            >
              <span className="flex items-center gap-1.5">
                <link.icon size={NAV_ICON_SIZE} />
                {link.text}
              </span>
            </NavLink>
          ))}
        </div>
        <IconActionLink
          icon={isDark ? Sun : Moon}
          label={isDark ? DARK_MODE_LABELS.toLight : DARK_MODE_LABELS.toDark}
          onClick={toggleDarkMode}
        />
      </div>
      <hr />
    </nav>
  );
}
