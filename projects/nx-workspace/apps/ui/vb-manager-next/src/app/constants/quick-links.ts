import { type QuickLink } from '@vigilant-broccoli/common-js';
import { PERSONAL_QUICK_LINKS } from '@vigilant-broccoli/personal-common-js';
import { APP_ROUTE_QUICK_LINKS } from '../app.const';

export const QUICK_LINKS: QuickLink[] = [
  ...APP_ROUTE_QUICK_LINKS,
  ...PERSONAL_QUICK_LINKS,
];
