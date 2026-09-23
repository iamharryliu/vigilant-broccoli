import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import {
  LOGO_PATH,
  NAV_LINKS,
  ROUTE_PATH,
} from '../../core/consts/routes.const';

const SCROLL_TRACKING_DELAY_MS = 1000;

const FADE_CLASSES = 'transition-opacity duration-500 ease-out';
const ACTIVE_CLASSES = 'underline underline-offset-4';
const BROWSER_LINK_CLASSES =
  'font-medium text-white hover:text-gray-200 inline-block transition-transform duration-200 hover:scale-110';

const withActive =
  (baseClasses: string) =>
  ({ isActive }: { isActive: boolean }) =>
    isActive ? `${baseClasses} ${ACTIVE_CLASSES}` : baseClasses;

// Mirrors general-components' lib-navbar: both bars fade out while scrolling
// down and fade back in on scroll up, ignoring the first second after load.
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M0 96C0 78.3 14.3 64 32 64h384c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zm0 160c0-17.7 14.3-32 32-32h384c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zm448 160c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h384c17.7 0 32 14.3 32 32z" />
            </svg>
          </button>
        </div>

        <div
          className={`absolute w-full bg-gray-300 pt-3 pb-3 ${
            isMobileNavOpen ? '' : 'hidden'
          }`}
        >
          <div className="space-y-3">
            {links.map(link => (
              <div key={link.to} className="flex justify-center">
                <NavLink
                  to={link.to}
                  end
                  onClick={() => setIsMobileNavOpen(false)}
                  className={withActive('')}
                >
                  {link.text}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
        <hr />
      </div>
    </>
  );
}
