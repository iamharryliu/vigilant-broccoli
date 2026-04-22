import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const RECAPTCHA_V3_SITE_KEY = new InjectionToken<string>(
  'RECAPTCHA_V3_SITE_KEY',
);

const RECAPTCHA_SCRIPT_URL = 'https://www.google.com/recaptcha/api.js';
const RECAPTCHA_DEFAULT_ACTION = 'submit';

interface GrecaptchaV3 {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

declare global {
  interface Window {
    grecaptcha: GrecaptchaV3;
  }
}

@Injectable({ providedIn: 'root' })
export class RecaptchaV3Service {
  private siteKey = inject(RECAPTCHA_V3_SITE_KEY);
  private scriptLoaded: Promise<void> | null = null;

  private loadScript(): Promise<void> {
    if (this.scriptLoaded) return this.scriptLoaded;

    this.scriptLoaded = new Promise<void>((resolve, reject) => {
      if (typeof window.grecaptcha !== 'undefined') {
        window.grecaptcha.ready(() => resolve());
        return;
      }

      const script = document.createElement('script');
      script.src = `${RECAPTCHA_SCRIPT_URL}?render=${this.siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => window.grecaptcha.ready(() => resolve());
      script.onerror = () =>
        reject(new Error('Failed to load reCAPTCHA script'));
      document.head.appendChild(script);
    });

    return this.scriptLoaded;
  }

  execute(action = RECAPTCHA_DEFAULT_ACTION): Observable<string> {
    return from(this.loadScript()).pipe(
      switchMap(() =>
        from(window.grecaptcha.execute(this.siteKey, { action })),
      ),
    );
  }
}
