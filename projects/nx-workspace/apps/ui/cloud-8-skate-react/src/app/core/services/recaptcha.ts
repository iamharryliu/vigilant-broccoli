import { ENVIRONMENT } from '../../../environments/environment';

const RECAPTCHA_SCRIPT_URL = 'https://www.google.com/recaptcha/api.js';
const RECAPTCHA_DEFAULT_ACTION = 'submit';

interface GrecaptchaV3 {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha?: GrecaptchaV3;
  }
}

let scriptLoaded: Promise<GrecaptchaV3> | null = null;

const loadRecaptcha = (): Promise<GrecaptchaV3> => {
  if (scriptLoaded) return scriptLoaded;

  scriptLoaded = new Promise((resolve, reject) => {
    const onReady = () =>
      window.grecaptcha?.ready(() =>
        resolve(window.grecaptcha as GrecaptchaV3),
      );
    if (window.grecaptcha) {
      onReady();
      return;
    }
    const script = document.createElement('script');
    script.src = `${RECAPTCHA_SCRIPT_URL}?render=${ENVIRONMENT.RECAPTCHA_V3_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => {
      scriptLoaded = null;
      reject(new Error('Failed to load reCAPTCHA script'));
    };
    document.head.appendChild(script);
  });

  return scriptLoaded;
};

export const getRecaptchaToken = async (
  action = RECAPTCHA_DEFAULT_ACTION,
): Promise<string> => {
  const grecaptcha = await loadRecaptcha();
  return grecaptcha.execute(ENVIRONMENT.RECAPTCHA_V3_SITE_KEY, { action });
};
