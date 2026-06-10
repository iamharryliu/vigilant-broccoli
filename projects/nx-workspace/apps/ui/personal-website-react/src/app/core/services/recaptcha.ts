import { useEffect } from 'react';
import { ENVIRONMENT } from '../../../environments/environment';

const RECAPTCHA_SCRIPT_ID = 'recaptcha-v3-script';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

export function useRecaptcha() {
  useEffect(() => {
    if (!ENVIRONMENT.RECAPTCHA_V3_SITE_KEY) return;
    if (document.getElementById(RECAPTCHA_SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = RECAPTCHA_SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${ENVIRONMENT.RECAPTCHA_V3_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);
}

export async function getRecaptchaToken(action: string): Promise<string> {
  if (!ENVIRONMENT.RECAPTCHA_V3_SITE_KEY || !window.grecaptcha) return '';
  return new Promise<string>(resolve => {
    window.grecaptcha!.ready(() => {
      window
        .grecaptcha!.execute(ENVIRONMENT.RECAPTCHA_V3_SITE_KEY, { action })
        .then(resolve)
        .catch(() => resolve(''));
    });
  });
}
