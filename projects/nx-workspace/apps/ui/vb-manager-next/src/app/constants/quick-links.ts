import { EXTERNAL_QUICK_LINKS, type QuickLink } from '@vigilant-broccoli/links';
import { APP_ROUTE_QUICK_LINKS } from '../app.const';

export type { QuickLink };

export const QUICK_LINKS: QuickLink[] = [
  ...APP_ROUTE_QUICK_LINKS,
  ...EXTERNAL_QUICK_LINKS,
];
