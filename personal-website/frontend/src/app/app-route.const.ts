import { Route, Routes } from '@angular/router';
import { AboutPageComponent } from '@pages/about-page/about-page.component';
import { HomePageComponent } from '@pages/home-page/home-page.component';
import { ContactPageComponent } from '@pages/contact-page/contact-page.component';
import { VibecheckLiteComponent } from '@app/demo-apps/vibecheck-lite/vibecheck-lite.component';
import { LinkTreePageComponent } from '@pages/link-tree-page/link-tree-page.component';

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

export const CONTACT_PAGE_ROUTE: Route = {
  path: 'contact-page',
  data: { title: 'contact page' },
  component: ContactPageComponent,
};

export const LINK_TREE_ROUTE: Route = {
  path: 'link-tree',
  data: { title: ' link tree' },
  component: LinkTreePageComponent,
};

export const CONTACT_ROUTE: Route = {
  path: 'contact',
  data: { title: ' contact' },
  children: [CONTACT_PAGE_ROUTE, LINK_TREE_ROUTE],
};

export const VIBECHECK_LITE_ROUTE: Route = {
  path: 'vibecheck-lite',
  data: { title: ' vibecheck lite' },
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
  CONTACT_PAGE: `/${CONTACT_ROUTE.path}/${CONTACT_PAGE_ROUTE.path}`,
  VIBECHECK_LITE: `/${PROJECT_ROUTE.path}/${VIBECHECK_LITE_ROUTE.path}`,
};

export const APP_ROUTES: Routes = [
  INDEX_ROUTE,
  ABOUT_ROUTE,
  CONTACT_ROUTE,
  PROJECT_ROUTE,
];
