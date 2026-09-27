import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTranslation } from '../../i18n';
import {
  LOGO_PATH,
  NAV_LINKS,
  ROUTE_PATH,
} from '../../core/consts/routes.const';
import { SidebarNav } from './sidebar-nav';

const MENU_ICON_SIZE = 20;

const SCROLL_TRACKING_DELAY_MS = 1000;

const FADE_CLASSES = 'transition-opacity duration-500 ease-out';
const ACTIVE_CLASSES = 'underline underline-offset-4';
const BROWSER_LINK_CLASSES =
  'font-medium text-white hover:text-gray-200 inline-block transition-transform duration-200 hover:scale-110';

const withActive =
  (baseClasses: string) =>
  ({ isActive }: { isActive: boolean }) =>
    isActive ? `${baseClasses} ${ACTIVE_CLASSES}` : baseClasses;

// Both bars fade out while scrolling down and fade back in on scroll up,
// ignoring the first second after load.
const useFadeOnScrollDown = (onFade: () => void) => {
  const [isFading, setIsFading] = useState(false);
  const onFadeRef = useRef(onFade);
  onFadeRef.current = onFade;

  useEffect(() => {
    let previousScrollTop = window.scrollY;
    let initialized = false;
    const timeout = window.setTimeout(() => {
      initialized = true;
    }, SCROLL_TRACKING_DELAY_MS);

    const onScroll = () => {
      if (!initialized || window.scrollY <= 0) return;
      const isScrollingDown = window.scrollY > previousScrollTop;
      setIsFading(isScrollingDown);
      if (isScrollingDown) onFadeRef.current();
      previousScrollTop = window.scrollY;
    };

    window.addEventListener('scroll', onScroll);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return isFading;
};

export function NavbarSection() {
  const { t } = useTranslation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isFading = useFadeOnScrollDown(() => setIsMobileNavOpen(false));
  const fadeClasses = `${FADE_CLASSES} ${isFading ? 'opacity-0' : ''}`;
  const links = NAV_LINKS.map(link => ({
    to: link.to,
    text: t(link.labelKey),
  }));

  return (
    <>
      <nav
        className={`hidden lg:block fixed w-full z-10 lg:bg-blue-500 ${fadeClasses}`}
      >
        <div className="flex items-center justify-between h-16 ml-6">
          <div className="space-x-4">
            <Link to={ROUTE_PATH.HOME} aria-label={t('APP.HOME_LINK_LABEL')}>
              <img
                src={LOGO_PATH}
                alt={t('APP.LOGO_ALT')}
                width={48}
                height={48}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                className="inline-block object-contain h-12 bg-white rounded-full p-1 border-4 border-pink-400"
              />
            </Link>
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={withActive(BROWSER_LINK_CLASSES)}
              >
                {link.text}
              </NavLink>
            ))}
          </div>
        </div>
        <hr />
      </nav>

      <div className={`lg:hidden bg-white z-10 fixed w-full ${fadeClasses}`}>
        <div className="flex justify-between ml-4 mr-8 pt-3 pb-3">
          <div>
            <Link to={ROUTE_PATH.HOME} aria-label={t('APP.HOME_LINK_LABEL')}>
              <img
                src={LOGO_PATH}
                alt={t('APP.LOGO_ALT')}
                width={40}
                height={40}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                className="inline-block object-contain h-10"
              />
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(open => !open)}
            aria-label={t('NAV.TOGGLE_MENU')}
            aria-expanded={isMobileNavOpen}
            className="text-gray-600 focus:outline-none"
          >
            <Menu size={MENU_ICON_SIZE} aria-hidden="true" />
          </button>
        </div>
        <hr />
      </div>

      <SidebarNav
        mobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />
    </>
  );
}
