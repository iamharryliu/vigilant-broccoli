import { NavLink } from 'react-router-dom';
import { LINKS } from '../../core/consts/routes.const';

const NAV_LINKS = [LINKS.ABOUT_PAGE, LINKS.CALENDAR_PAGE, LINKS.CONTACT_PAGE];

const activeClass = 'text-blue-600 dark:text-blue-400 font-semibold';

const linkClass =
  "text-sm relative py-1 transition-all duration-200 hover:text-blue-600 dark:hover:text-blue-400 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-200 hover:after:w-full";

export function NavbarSection() {
  return (
    <nav className="hidden md:block sticky top-0 bg-inherit transition-opacity duration-500">
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
  );
}
