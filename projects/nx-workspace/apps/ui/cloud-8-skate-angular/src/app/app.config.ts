import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ROUTES } from './core/consts/routes.const';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  RECAPTCHA_V3_SITE_KEY,
  RecaptchaInterceptor,
} from 'general-components';
import { ENVIRONMENT } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(ROUTES),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: ENVIRONMENT.RECAPTCHA_V3_SITE_KEY,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RecaptchaInterceptor,
      multi: true,
    },
  ],
};
