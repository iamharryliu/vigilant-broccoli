import { Route, Routes } from '@angular/router';
import { AboutPageComponent } from '@components/about-page/about-page.component';
import { ContactPageComponent } from '@components/contact-page/contact-page.component';
import { HomePageComponent } from '@components/home-page/home-page.component';

export const INDEX_ROUTE: Route = {
  path: '',
  canActivate: [],
  data: {},
  component: HomePageComponent,
};

export const ABOUT_ROUTE: Route = {
  path: 'about',
  component: AboutPageComponent,
};

export const CONTACT_ROUTE: Route = {
  path: 'contact',
  component: ContactPageComponent,
};

export const APP_PATH = {
  INDEX: ``,
  ABOUT: `/${ABOUT_ROUTE.path}`,
  CONTACT: `/${CONTACT_ROUTE.path}`,
};

export const APP_ROUTES: Routes = [INDEX_ROUTE, ABOUT_ROUTE, CONTACT_ROUTE];
