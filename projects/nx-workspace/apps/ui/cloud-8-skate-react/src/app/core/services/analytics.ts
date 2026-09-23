import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ENVIRONMENT } from '../../../environments/environment';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const initAnalytics = () => {
  if (!ENVIRONMENT.ANALYTICS_ID || window.gtag) return;

  const dataLayer = (window.dataLayer = window.dataLayer ?? []);
  window.gtag = function () {
    // gtag.js only recognises the Arguments object, not a rest-param array.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', ENVIRONMENT.ANALYTICS_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ENVIRONMENT.ANALYTICS_ID}`;
  document.head.appendChild(script);
};

export const usePageviewTracking = () => {
  const { pathname, search } = useLocation();
  const isFirstPageview = useRef(true);

  useEffect(() => {
    // gtag('config') in initAnalytics already sends the first page view.
    if (isFirstPageview.current) {
      isFirstPageview.current = false;
      return;
    }
    window.gtag?.('config', ENVIRONMENT.ANALYTICS_ID, {
      page_path: `${pathname}${search}`,
      page_location: document.location.href,
    });
  }, [pathname, search]);
};
