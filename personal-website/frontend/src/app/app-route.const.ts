import { Route, Routes } from '@angular/router';
import { AboutPageComponent } from '@components/about-page/about-page.component';
import { HomePageComponent } from '@components/home-page/home-page.component';
import { StorePageComponent } from '@components/store-page/store-page.component';
import { ContactPageComponent } from '@components/contact-page/contact-page.component';

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

export const STORE_ROUTE: Route = {
  path: 'store',
  data: { title: ' store' },
  component: StorePageComponent,
};

export const APP_PATH = {
  INDEX: '',
  ABOUT: `/${ABOUT_ROUTE.path}`,
  CONTACT: `/${CONTACT_ROUTE.path}`,
  STORE: `/${STORE_ROUTE.path}`,
};

export const APP_ROUTES: Routes = [
  INDEX_ROUTE,
  ABOUT_ROUTE,
  CONTACT_ROUTE,
  STORE_ROUTE,
];
