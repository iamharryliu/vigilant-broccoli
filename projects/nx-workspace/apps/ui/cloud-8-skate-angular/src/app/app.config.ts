import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ROUTES } from './core/consts/routes.const';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(ROUTES),
    provideClientHydration(),
    provideHttpClient(withFetch()),
  ],
};
