import { type QuickLink } from '@vigilant-broccoli/common-js';
import { EXTERNAL_QUICK_LINKS } from '@vigilant-broccoli/manager';
import { APP_ROUTE_QUICK_LINKS } from '../app.const';

export const QUICK_LINKS: QuickLink[] = [
  ...APP_ROUTE_QUICK_LINKS,
  ...EXTERNAL_QUICK_LINKS,
];
