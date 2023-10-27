import { Route, Routes } from '@angular/router';
import { AboutPageComponent } from '@components/about-page/about-page.component';
import { HomePageComponent } from '@components/home-page/home-page.component';
import { ContactPageComponent } from '@components/contact-page/contact-page.component';
import { VibecheckLiteComponent } from '@components/vibecheck-lite/vibecheck-lite.component';

export const INDEX_ROUTE: Route = {
  path: '',
  data: { title: 'home' },
  component: HomePageComponent,
};

export const ABOUT_ROUTE: Route = {
  path: 'about',
  data: { title: 'about' },
  component: AboutPageComponent,
};

export const CONTACT_ROUTE: Route = {
  path: 'contact',
  data: { title: ' contact' },
  component: ContactPageComponent,
};

export const VIBECHECK_LITE_ROUTE: Route = {
  path: 'vibecheck-lite',
  data: { title: ' vibecheck-lite' },
  component: VibecheckLiteComponent,
};

export const PROJECT_ROUTE: Route = {
  path: 'projects',
  data: { title: ' projects' },
  children: [VIBECHECK_LITE_ROUTE],
};

export const APP_PATH = {
  INDEX: '',
  ABOUT: `/${ABOUT_ROUTE.path}`,
  CONTACT: `/${CONTACT_ROUTE.path}`,
  VIBECHECK_LITE: `/${PROJECT_ROUTE.path}/${VIBECHECK_LITE_ROUTE.path}`,
};

export const APP_ROUTES: Routes = [
  INDEX_ROUTE,
  ABOUT_ROUTE,
  CONTACT_ROUTE,
  PROJECT_ROUTE,
];
