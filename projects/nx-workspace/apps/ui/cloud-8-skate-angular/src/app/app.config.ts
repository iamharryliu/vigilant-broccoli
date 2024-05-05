import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ROUTES } from './core/consts/routes.const';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(ROUTES), provideHttpClient()],
};
