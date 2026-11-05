import { type QuickLink } from '@vigilant-broccoli/common-js';
import { VB_MONITORING_URL } from '@vigilant-broccoli/infrastructure';
import { EXTERNAL_QUICK_LINKS } from '@vigilant-broccoli/manager';
import { APP_ROUTE_QUICK_LINKS } from '../app.const';

export const QUICK_LINKS: QuickLink[] = [
  ...APP_ROUTE_QUICK_LINKS,
  ...EXTERNAL_QUICK_LINKS.filter(
    link => link.target !== VB_MONITORING_URL.STATUS.URL,
  ),
];
