import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ENVIRONMENT } from '../../../environments/environment';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  if (!ENVIRONMENT.ANALYTICS_ID) return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ENVIRONMENT.ANALYTICS_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ENVIRONMENT.ANALYTICS_ID);
}

export function usePageviewTracking() {
  const location = useLocation();
  useEffect(() => {
    if (!ENVIRONMENT.ANALYTICS_ID || !window.gtag) return;
    window.gtag('config', ENVIRONMENT.ANALYTICS_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location]);
}
