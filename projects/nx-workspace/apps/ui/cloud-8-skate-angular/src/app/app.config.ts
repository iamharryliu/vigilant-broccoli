import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ROUTES } from './core/consts/routes.const';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import {
  CredentialsInterceptorService,
  RecaptchaInterceptor,
} from 'general-components';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(ROUTES),
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RecaptchaInterceptor,
      multi: true,
    },
  ],
};
